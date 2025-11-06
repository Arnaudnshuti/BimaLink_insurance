import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, Camera, MapPin, CheckCircle, AlertCircle, Clock } from "lucide-react";

const KycPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [progress, setProgress] = useState(30);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: ""
  });

  const [documents, setDocuments] = useState({
    idFront: null,
    idBack: null,
    photo: null,
    proofOfResidence: null,
    license: null
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    companyName: "",
    position: "",
    licenseNumber: "",
    licenseExpiry: ""
  });

  // Compliance tracker data
  const complianceItems = [
    { requirement: "Personal Information", status: "verified", verifiedBy: "System", date: "2023-10-15" },
    { requirement: "National ID Verification", status: "pending", verifiedBy: "-", date: "-" },
    { requirement: "Document Uploads", status: "pending", verifiedBy: "-", date: "-" },
    { requirement: "Professional Information", status: "pending", verifiedBy: "-", date: "-" },
    { requirement: "Address Verification", status: "pending", verifiedBy: "-", date: "-" }
  ];

  // Handle tab change and update progress
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update progress based on tab
    switch(value) {
      case "personal":
        setProgress(30);
        break;
      case "documents":
        setProgress(50);
        break;
      case "professional":
        setProgress(75);
        break;
      case "compliance":
        setProgress(90);
        break;
      default:
        setProgress(30);
    }
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle professional info changes
  const handleProfessionalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfessionalInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle document upload
  const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      // Simulate upload and AI verification
      setTimeout(() => {
        setIsUploading(false);
        setIsVerifying(true);
        
        setTimeout(() => {
          setIsVerifying(false);
          toast({
            title: "Document Verified",
            description: `${type} has been successfully uploaded and verified.`,
            variant: "default",
          });
          
          // Update documents state
          setDocuments(prev => ({
            ...prev,
            [type]: e.target.files ? e.target.files[0] : null
          }));
        }, 2000);
      }, 1500);
    }
  };

  // Auto-verify National ID
  const verifyNationalId = () => {
    if (personalInfo.nationalId.length < 8) {
      toast({
        title: "Verification Failed",
        description: "Please enter a valid National ID number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate API verification
    setTimeout(() => {
      setIsVerifying(false);
      toast({
        title: "ID Verified Successfully",
        description: "Your National ID has been verified with the national database.",
        variant: "default",
      });
      
      // Auto-fill some fields based on "verification"
      if (!personalInfo.fullName) {
        setPersonalInfo(prev => ({
          ...prev,
          fullName: "John Doe",
          province: "Kigali",
          district: "Gasabo"
        }));
      }
    }, 2000);
  };

  // Capture GPS location
  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation(`${latitude}, ${longitude}`);
          
          toast({
            title: "Location Captured",
            description: "Your current location has been recorded for address verification.",
            variant: "default",
          });
          
          // Update address field
          setPersonalInfo(prev => ({
            ...prev,
            address: `Verified Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to capture your location. Please allow location access.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  // Submit KYC verification
  const submitKyc = () => {
    setVerificationStatus("reviewing");
    setProgress(95);
    
    // Simulate submission and review process
    setTimeout(() => {
      setVerificationStatus("verified");
      setProgress(100);
      
      toast({
        title: "KYC Verification Complete",
        description: "Your KYC verification has been successfully completed. You will receive an email confirmation shortly.",
        variant: "default",
      });
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }, 3000);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Complete KYC</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complete KYC Verification</h1>
          <p className="text-muted-foreground">Ensure Compliance and Secure Onboarding for Agents & Brokers</p>
        </div>
      </div>
      
      {/* KYC Progress Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>KYC Verification Progress</CardTitle>
          <CardDescription>
            {progress < 100 
              ? `${progress}% Complete - ${4 - Math.floor(progress/25)} sections remaining` 
              : "100% Verified - All requirements completed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <StatusBadge status={progress >= 30 ? "verified" : "pending"} />
                <span className="ml-2">Personal Info</span>
              </div>
              <div className="flex items-center">
                <StatusBadge status={progress >= 50 ? "verified" : "pending"} />
                <span className="ml-2">Documents</span>
              </div>
              <div className="flex items-center">
                <StatusBadge status={progress >= 75 ? "verified" : "pending"} />
                <span className="ml-2">Professional Info</span>
              </div>
              <div className="flex items-center">
                <StatusBadge status={verificationStatus} />
                <span className="ml-2">Verification</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="documents">Upload Documents</TabsTrigger>
          <TabsTrigger value="professional">Professional Info</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
        </TabsList>
        
        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Provide your personal details for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    value={personalInfo.fullName}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="nationalId" 
                      name="nationalId" 
                      placeholder="Enter your National ID number" 
                      value={personalInfo.nationalId}
                      onChange={handlePersonalInfoChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={verifyNationalId}
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify ID"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select your date of birth"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="Enter your phone number" 
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="address" 
                      name="address" 
                      placeholder="Enter your address" 
                      value={personalInfo.address}
                      onChange={handlePersonalInfoChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={captureLocation}
                    >
                      <MapPin className="w-4 h-4 mr-2" /> Capture GPS
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select 
                    onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, province: value }))}
                    value={personalInfo.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kigali">Kigali</SelectItem>
                      <SelectItem value="northern">Northern Province</SelectItem>
                      <SelectItem value="southern">Southern Province</SelectItem>
                      <SelectItem value="eastern">Eastern Province</SelectItem>
                      <SelectItem value="western">Western Province</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select 
                    onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, district: value }))}
                    value={personalInfo.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasabo">Gasabo</SelectItem>
                      <SelectItem value="kicukiro">Kicukiro</SelectItem>
                      <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button onClick={() => handleTabChange("documents")}>Next: Upload Documents</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Documents Upload Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* National ID Front */}
                <Card className="border-dashed border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">National ID (Front)</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    {documents.idFront ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Document verified</p>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your ID or
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleDocumentUpload("idFront", e)}
                    />
                  </CardContent>
                </Card>
                
                {/* National ID Back */}
                <Card className="border-dashed border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">National ID (Back)</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    {documents.idBack ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Document verified</p>
                        <Button variant="outline" size="sm">
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your ID or
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Passport Photo */}
                <Card className="border-dashed border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Passport-size Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    {documents.photo ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Document verified</p>
                        <Button variant="outline" size="sm">
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your photo or
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Proof of Residence */}
                <Card className="border-dashed border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Proof of Residence</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    {documents.proofOfResidence ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Document verified</p>
                        <Button variant="outline" size="sm">
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your document or
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Agent/Broker License */}
                <Card className="border-dashed border-2 col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Agent/Broker License</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    {documents.license ? (
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Document verified</p>
                        <Button variant="outline" size="sm">
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your license or
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Upload Status */}
              {(isUploading || isVerifying) && (
                <Card className="border-none bg-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <div>
                        <p className="font-medium">{isUploading ? "Uploading document..." : "Verifying document with AI..."}</p>
                        <p className="text-sm text-muted-foreground">This may take a few moments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("personal")}>Previous: Personal Details</Button>
              <Button onClick={() => handleTabChange("professional")}>Next: Professional Info</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Provide your professional details for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company/Brokerage Name</Label>
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    placeholder="Enter your company name" 
                    value={professionalInfo.companyName}
                    onChange={handleProfessionalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    name="position" 
                    placeholder="Enter your position" 
                    value={professionalInfo.position}
                    onChange={handleProfessionalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input 
                    id="licenseNumber" 
                    name="licenseNumber" 
                    placeholder="Enter your license number" 
                    value={professionalInfo.licenseNumber}
                    onChange={handleProfessionalInfoChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {professionalInfo.licenseExpiry ? professionalInfo.licenseExpiry : "Select expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            setProfessionalInfo(prev => ({ 
                              ...prev, 
                              licenseExpiry: format(date, "yyyy-MM-dd") 
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifications" />
                  <Label htmlFor="notifications">Receive license expiry notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">I confirm that all information provided is accurate and complete</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("documents")}>Previous: Upload Documents</Button>
              <Button onClick={() => handleTabChange("compliance")}>Next: Compliance Tracker</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Compliance Tracker Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Tracker</CardTitle>
              <CardDescription>Track your KYC verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>KYC requirements and verification status</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.requirement}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.verifiedBy}</TableCell>
                      <TableCell>{item.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={submitKyc}
                  disabled={verificationStatus === "reviewing" || verificationStatus === "verified"}
                >
                  {verificationStatus === "pending" && "Submit for Verification"}
                  {verificationStatus === "reviewing" && "Under Review..."}
                  {verificationStatus === "verified" && "Verification Complete"}
                </Button>
              </div>
              
              {verificationStatus !== "pending" && (
                <div className="w-full bg-muted p-4 rounded-md">
                  <div className="flex items-center space-x-4">
                    {verificationStatus === "reviewing" ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <div>
                          <p className="font-medium">Your KYC submission is under review</p>
                          <p className="text-sm text-muted-foreground">You will receive an email notification once verified</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <p className="font-medium">KYC verification complete!</p>
                          <p className="text-sm text-muted-foreground">You can now access all features of BimaLink</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="w-full flex justify-start">
                <Button variant="outline" onClick={() => handleTabChange("professional")}>
                  Previous: Professional Info
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KycPage;