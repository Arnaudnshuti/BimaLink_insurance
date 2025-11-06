package Backend.bimalink.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import Backend.bimalink.entity.User;
import Backend.bimalink.entity.Agent;
import Backend.bimalink.entity.Customer;
import Backend.bimalink.dto.*;
import Backend.bimalink.repository.UserRepository;
import Backend.bimalink.repository.AgentRepository;
import Backend.bimalink.repository.CustomerRepository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Authentication Service for handling user registration and authentication.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final CustomerRepository customerRepository;
    private final OtpService otpService;
    private final JwtService jwtService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(user.getPassword())
            .authorities(user.getRole())
            .disabled(!user.getEnabled())
            .build();
    }

    /**
     * Register a new agent
     */
    public void registerAgent(RegisterAgentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt
            .hashpw(request.getPassword(), org.springframework.security.crypto.bcrypt.BCrypt.gensalt());

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(hashedPassword)
            .role("ROLE_AGENT")
            .enabled(false) // Disabled until OTP verified
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);

        Agent agent = Agent.builder()
            .userId(savedUser.getId())
            .agentCode("AG" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .nrcNumber(request.getNrcNumber())
            .address(request.getAddress())
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        agentRepository.save(agent);
        otpService.createAndSendOtp(savedUser.getId(), request.getEmail());
        
        log.info("Agent registered: {}", savedUser.getUsername());
    }

    /**
     * Verify OTP and return JWT token
     */
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!otpService.verifyOtp(user.getId(), request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        user.setEnabled(true);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        
        // Get agent or customer info
        String fullName = "";
        var agentOpt = agentRepository.findByUserId(user.getId());
        var customerOpt = customerRepository.findByUserId(user.getId());
        
        if (agentOpt.isPresent()) {
            fullName = agentOpt.get().getFullName();
        } else if (customerOpt.isPresent()) {
            fullName = customerOpt.get().getFullName();
        }
        
        String firstName = "";
        String lastName = "";
        if (fullName.contains(" ")) {
            String[] names = fullName.split(" ", 2);
            firstName = names[0];
            lastName = names.length > 1 ? names[1] : "";
        } else {
            firstName = fullName;
        }
        
        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
            .id(user.getId().toString())
            .email(user.getEmail())
            .firstName(firstName)
            .lastName(lastName)
            .role(user.getRole().replace("ROLE_", "").toLowerCase())
            .build();
        
        return AuthResponse.builder()
            .token(token)
            .message("OTP verified successfully")
            .user(userInfo)
            .build();
    }

    /**
     * Login user - first step (validate credentials and send OTP)
     */
    public void loginInitiate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getEnabled()) {
            throw new RuntimeException("Account not activated. Please verify your email.");
        }

        if (!org.springframework.security.crypto.bcrypt.BCrypt
            .checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Send OTP for login verification
        otpService.createAndSendOtp(user.getId(), user.getEmail());
        log.info("Login OTP sent to user: {}", user.getEmail());
    }
    
    /**
     * Complete login after OTP verification
     */
    public AuthResponse login(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (!otpService.verifyOtp(user.getId(), request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Enable user if not already enabled
        if (!user.getEnabled()) {
            user.setEnabled(true);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        
        // Get agent or customer info
        String fullName = "";
        var agentOpt = agentRepository.findByUserId(user.getId());
        var customerOpt = customerRepository.findByUserId(user.getId());
        
        if (agentOpt.isPresent()) {
            fullName = agentOpt.get().getFullName();
        } else if (customerOpt.isPresent()) {
            fullName = customerOpt.get().getFullName();
        }
        
        String firstName = "";
        String lastName = "";
        if (fullName.contains(" ")) {
            String[] names = fullName.split(" ", 2);
            firstName = names[0];
            lastName = names.length > 1 ? names[1] : "";
        } else {
            firstName = fullName;
        }
        
        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
            .id(user.getId().toString())
            .email(user.getEmail())
            .firstName(firstName)
            .lastName(lastName)
            .role(user.getRole().replace("ROLE_", "").toLowerCase())
            .build();
        
        return AuthResponse.builder()
            .token(token)
            .message("Login successful")
            .user(userInfo)
            .build();
    }

    /**
     * Resend OTP
     */
    public void resendOtp(ResendOtpRequest request) {
        otpService.resendOtp(request.getEmail());
    }
    
    /**
     * Register a new user (agent or customer)
     */
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt
            .hashpw(request.getPassword(), org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
        
        String username = request.getEmail().substring(0, request.getEmail().indexOf('@'));
        int counter = 0;
        String finalUsername = username;
        while (userRepository.existsByUsername(finalUsername)) {
            counter++;
            finalUsername = username + counter;
        }

        User user = User.builder()
            .username(finalUsername)
            .email(request.getEmail())
            .password(hashedPassword)
            .role("ROLE_" + request.getRole().toUpperCase())
            .enabled(false) // Disabled until OTP verified
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);

        String fullName = request.getFirstName() + " " + request.getLastName();
        
        if ("agent".equalsIgnoreCase(request.getRole())) {
            Agent agent = Agent.builder()
                .userId(savedUser.getId())
                .agentCode("AG" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .fullName(fullName)
                .phone(request.getPhone())
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            agentRepository.save(agent);
        } else if ("customer".equalsIgnoreCase(request.getRole())) {
            Customer customer = Customer.builder()
                .userId(savedUser.getId())
                .customerCode("CU" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .fullName(fullName)
                .phone(request.getPhone())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            customerRepository.save(customer);
        }

        otpService.createAndSendOtp(savedUser.getId(), request.getEmail());
        
        log.info("User registered: {} as {}", savedUser.getUsername(), request.getRole());
    }
}
