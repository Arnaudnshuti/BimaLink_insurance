package Backend.bimalink.repository;

import Backend.bimalink.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);
    Optional<Customer> findByCustomerCode(String customerCode);
    boolean existsByNrcNumber(String nrcNumber);
}
