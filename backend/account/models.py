from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp

class User(AbstractUser):
    ROLE_CHOICE = (
        ("ADMIN", "Admin"),
        ("TEST_MANAGER", "Test Manager"),
        ("TESTER", "Tester"),
        ("CUSTOMER", "Customer"),
        ("SUPPORTADMIN", "Support Admin"),
        ("MASTER", "Master"),
    )

    ACCOUNT_STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("SUSPENDED", "Suspended"),
        ("PENDING", "Pending"),
    )

    user_id = models.CharField(max_length=20, unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICE,
        default="CUSTOMER"
    )

    account_status = models.CharField(
        max_length=20,
        choices=ACCOUNT_STATUS_CHOICES,
        default="ACTIVE"
    )

    contact = models.CharField( max_length=10, blank=True, null=True)

    organization = models.CharField(max_length=100, blank=True, null=True)    
    location = models.CharField(max_length=100, blank=True, null=True)

    # email = models.EmailField(blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    contact_person_email =  models.EmailField(blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)

    department = models.CharField(max_length=100, blank=True, null=True)
    totp_secret = models.CharField(max_length=64, blank=True, null=True)
    mfa_enabled = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):

        if not self.user_id:

            prefix_map = {
                "ADMIN": "ADM",
                "TEST_MANAGER": "TM",
                "TESTER": "TST",
                "CUSTOMER": "CUS",
                "SUPPORTADMIN": "SUP",
                "MASTER": "MAS",
            }

            prefix = prefix_map.get(self.role, "USR")

            last_user = User.objects.filter(
                user_id__startswith=prefix
            ).order_by("-id").first()

            if last_user and last_user.user_id:
                try:
                    last_number = int(last_user.user_id.split("-")[1])
                    next_number = last_number + 1
                except:
                    next_number = 1
            else:
                next_number = 1

            self.user_id = f"{prefix}-{next_number:03d}"

        super().save(*args, **kwargs)

    def generate_totp_secret(self):
        if not self.totp_secret:
            self.totp_secret = pyotp.random_base32()
            self.save(update_fields=["totp_secret"])
        return self.totp_secret

    def get_totp_uri(self):
        if not self.totp_secret:
            self.generate_totp_secret()

        totp = pyotp.TOTP(self.totp_secret)
        return totp.provisioning_uri(name=self.email, issuer_name="CyberToolKit")

    def verify_totp(self, code):
        if not self.totp_secret:
            return False
        return pyotp.TOTP(self.totp_secret).verify(code)

    def enable_mfa(self):
        self.mfa_enabled = True
        self.save(update_fields=["mfa_enabled"])

    def disable_mfa(self):
        self.mfa_enabled = False
        self.totp_secret = None
        self.save(update_fields=["mfa_enabled", "totp_secret"])

    def __str__(self):
        return f"{self.email} ({self.role})"

# ROLE & PERMISSIONS
class Role(models.Model):
    role_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    roleId = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.role_name


class Permission(models.Model):
    module = models.CharField(max_length=100)
    action = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.module} - {self.action}"


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("role", "permission")


# TEMP SUPER ADMIN
class TemporarySuperAdmin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reason = models.TextField()

    start_time = models.DateTimeField()
    expiry_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        User,
        related_name="created_temp_admins",
        on_delete=models.CASCADE
    )


# USER SESSION
class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    jwt_token = models.TextField()

    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(default="0.0.0.0")
    device = models.CharField(max_length=200, default="unknown")
    active = models.BooleanField(default=True)

# PROJECT
class Project(models.Model):

    PROJECT_TYPE = (
        ("WEBAPP", "Web Application"),
        ("MOBILE", "Mobile"),
        ("NETWORK", "Network"),
        ("IOT", "IOT"),
        # ("RADIO", "Radio"),
        ("THICK", "Thick Client"),
        ("SOURCE", "Source Code Analysis"),
    )

    STATUS = (
        ("CREATED", "Created"),
        ("ASSIGNED_PENDING", "Tester Assigned Pending"),
        ("TESTER_ASSIGNED", "Tester Assigned"),
        ("TESTING", "Testing"),
        ("REPORT_PENDING", "Report Pending"),
        ("APPROVED", "Approved"),
        ("COMPLETED", "Completed"),
    )

    PRIORITY = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    )

    CATEGORY = (
        ("SR", "Software"),
        ("HW", "Hardware"),
        ("AI", "AI Module"),
        ("API", "API"),
        ("DB", "Database"),
        ("ENC", "Encryption"),
        ("BKP", "Backup"),
        ("NV", "Notification"),
        ("PRIV", "Privacy"),
        ("INT", "Integration"),
        ("ST", "Standard"),
    )

    STAGE_CHOICES = [
        ("INFO", "Information Gathering"),
        ("SCAN", "Scanning"),
        ("VULN", "Vulnerability Assessment"),
        ("EXPLOIT", "Exploitation"),
        ("POST", "Post Exploitation"),
        ("COMPLETED", "Completed"),
    ]
    
    project_id = models.CharField(max_length=20, unique=True)
    project_name = models.CharField(max_length=200)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE)

    customer = models.ForeignKey(
        User,
        limit_choices_to={"role": "CUSTOMER"},
        on_delete=models.CASCADE,
        related_name="customer_projects"
    )

    manager = models.ForeignKey(
        User,
        limit_choices_to={"role": "TEST_MANAGER"},
        on_delete=models.CASCADE,
        related_name="managed_projects"
    )
   
    testing_stage = models.CharField(
        max_length=20,
        choices=STAGE_CHOICES,
        default="INFO"
    )

    project_desc = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY)
    status = models.CharField(max_length=30, choices=STATUS)
    start_date = models.DateField()
    deadline = models.DateField()
    progress = models.IntegerField(default=0)
    current_stage = models.CharField( max_length=20, default="INFO" )

    def save(self, *args, **kwargs):
        if not self.project_id:
            last_project = Project.objects.order_by("-id").first()

            if last_project:
                last_number = int(last_project.project_id.replace("PRO", ""))
                new_number = last_number + 1
            else:
                new_number = 1

            self.project_id = f"PRO{new_number:03d}"

        super().save(*args, **kwargs)


# PROJECT ASSIGNMENT (FIXED)
class ProjectAssignment(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    tester = models.ForeignKey(
        User,
        limit_choices_to={"role":"TESTER"},
        on_delete=models.CASCADE,
        related_name="assigned_projects"
    )

    assigned_by = models.ForeignKey(
        User,
        limit_choices_to={"role":"TEST_MANAGER"},
        on_delete=models.CASCADE,
        related_name="tester_assignments"
    )

    assigned_date = models.DateField(auto_now_add=True)


class Reports(models.Model):

    STATUS = [
        ("PENDING","Pending"),
        ("APPROVED","Approved"),
        ("COMPLETED","Completed"),
    ]

    report_id = models.CharField(max_length=20, unique=True, blank=True )
    project = models.ForeignKey(Project, on_delete=models.CASCADE )
    report_status = models.CharField( max_length=20, choices=STATUS) 

    def save(self,*args,**kwargs):

        if not self.report_id:

            last_report = Reports.objects.order_by("-id").first()

            if last_report:
                number = int(
                    last_report.report_id.replace("REP","")
                ) + 1
            else:
                number = 1

            self.report_id = f"REP{number:03d}"


        super().save(*args,**kwargs)


# PROJECT SCOPE
class ProjectScope(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    scope = models.TextField()


# VULNERABILITY
class Vulnerability(models.Model):

    SEVERITY = (
        ("CRITICAL", "Critical"),
        ("HIGH", "High"),
        ("MEDIUM", "Medium"),
        ("LOW", "Low"),
    )

    STATUS = (
        ("IDENTIFIED", "Identified"),
        ("RECORDED", "Recorded"),
        ("SUBMITTED", "Submitted"),
        ("UNDER_REVIEW", "Under Review"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    vuln_id = models.CharField(max_length=20, unique=True)
    vuln_title = models.CharField(max_length=250)
    vuln_category = models.CharField(max_length=150)
    vuln_desc = models.TextField()

    severity = models.CharField(max_length=20, choices=SEVERITY)

    cvss_score = models.DecimalField(max_digits=4, decimal_places=1)
    cwe = models.CharField(max_length=50, blank=True)
    cve = models.CharField(max_length=50, blank=True)

    affected_component = models.TextField()
    remediation = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS)

    created_at = models.DateTimeField(auto_now_add=True)

    tester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reported_vulnerabilities"
    )

    def save(self, *args, **kwargs):
        if not self.vuln_id:
            last_vuln = Vulnerability.objects.order_by("-id").first()

            if last_vuln:
                last_number = int(last_vuln.vuln_id.replace("VUL", ""))
                new_number = last_number + 1
            else:
                new_number = 1

            self.vuln_id = f"VUL{new_number:03d}"

        super().save(*args, **kwargs)


class Requirement(models.Model):

    CATEGORY = [
        ("SR", "Software"),
        ("HW", "Hardware"),
        ("AI", "AI Module"),
        ("API", "API"),
        ("DB", "Database"),
        ("ENC", "Encryption"),
        ("BKP", "Backup"),
        ("NV", "Notification"),
        ("PRIV", "Privacy"),
        ("INT", "Integration"),
        ("ST", "Standard"),
    ]

    TYPE = [
        ("FR", "Functional"),
        ("NFR", "Non Functional"),
        ("BR", "Business"),
        ("VR", "Validation"),
        ("CC", "Compliance"),
    ]

    version = models.CharField(max_length=10, default="V1")
    unique_id = models.CharField(max_length=4)
    sub_module = models.CharField(max_length=2, blank=True)

    requirement_id = models.CharField(max_length=50, unique=True)

    title = models.CharField(max_length=200)
    description = models.TextField()

class Suites(models.Model):
    suite_id = models.CharField(max_length=20, unique=True)
    suite_name = models.CharField(max_length=100)
    suite_code = models.CharField(max_length=20)
    std_follows = models.CharField(max_length=50)
    suite_desc = models.TextField()

    def save(self,*args,**kwargs):
        if not self.suite_id:
            last = Suites.objects.order_by("-id").first()
            if last:
                num = int(last.suite_id.replace("SUT","")) + 1
            else:
                num = 1

            self.suite_id = f"SUT{num:03d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.suite_name

class Stages(models.Model):
    STAGE_CHOICES = (
        ("INFO","Information Gathering"),
        ("SCAN","Scanning & Enumeration"),
        ("VULN","Vulnerability Assessment"),
        ("EXPLOIT","Exploitation"),
        ("POST","Post Exploitation"),
    )

    stage_id = models.CharField( max_length=20, unique=True )
    stage_name = models.CharField( max_length=50, choices=STAGE_CHOICES )
    stage_order = models.IntegerField()

    def __str__(self):
        return self.stage_name


class Tools(models.Model):
    CATEGORY = (
        ("SOFTWARE","Software Tool"),
        ("HARDWARE","Hardware Tool"),
    )

    tool_id = models.CharField( max_length=20, unique=True )
    tool_name = models.CharField( max_length=50, unique=True )
    tool_desc = models.TextField(blank=True)
    tool_category = models.CharField( max_length=20, choices=CATEGORY )
    command_supported = models.BooleanField(default=True)
    tool_status = models.BooleanField(default=True)

    def save(self,*args,**kwargs):
        if not self.tool_id:
            last = Tools.objects.order_by("-id").first()

            if last:
                num=int( last.tool_id.replace("TOL","") )+1
            else:
                num=1

            self.tool_id=f"TOL{num:04d}"
        super().save(*args,**kwargs)


# class SuiteStageMapping(models.Model):
class SuiteStageMapping(models.Model):
    suite = models.ForeignKey( Suites, on_delete=models.CASCADE )
    stage = models.ForeignKey( Stages, on_delete=models.CASCADE )

    class Meta:
        unique_together = ( "suite", "stage" )

    def __str__(self):
        return f"{self.suite}-{self.stage}"


class ToolMapping(models.Model):
    suite = models.ForeignKey( Suites, on_delete=models.CASCADE )
    stage = models.ForeignKey( Stages, on_delete=models.CASCADE )

    tool = models.ForeignKey( Tools, on_delete=models.CASCADE )

    hardware_required = models.ManyToManyField( Tools, blank=True, related_name="hardware_dependencies" )
    notes = models.TextField( blank=True )

    class Meta:
        unique_together = (
            "suite",
            "stage",
            "tool"
        )

    def __str__(self):
        return ( f"{self.suite} - " f"{self.stage} - " f"{self.tool}" )

class Standards(models.Model):
    standard_name = models.CharField(max_length=20)
    standard_desc = models.TextField()

class Protocols(models.Model):
    CATEGORY_CHOICES = [  
        ("WEB","Web"),
        ("MOBILE","Mobile"),
        ("NETWORK","Networking"),
        ("IOT","IoT"),
        ("RADIO","Radio"),
        ("THICK","Thick Client"),
        ("SOURCE","Source Code Analysis"),
    ]


    OSI_LAYER_CHOICES = [
        ("LAYER1","Physical"),
        ("LAYER2","Data Link"),
        ("LAYER3","Network"),
        ("LAYER4","Trasport"),
        ("LAYER5","Session"),
        ("LAYER6","Presentation"),
        ("LAYER7","Application"),
    ]

    TRANSPORT_PROTOCOL_CHOICES = [            
        ("TCP","TCP"),
        ("UDP","UDP"),
        ("TCP/UDP","TCP/UDP"),
        ("QUIC","QUIC"),
        ("HTTP","HTTP"),
        ("HTTP/2","HTTP/2"),
        ("HTTP/3","HTTP/3"),
        ("HTTPS","HTTPS"),
        ("IP","IP"),
        ("TCP_IP","TCP/IP"),
        ("ETHERNET","Ethernet"),
        ("CAN","CAN"),
        ("CAN_FD","CAN FD"),
        ("LIN","LIN"),
        ("FLECRAY","FlexRay"),
        ("SPI","SPI"),
        ("I2C","I2C"),
        ("UART","UART"),
        ("USB","USB"),
        ("BLE","Bluetooth"),
        # ("BLE","BLE"),
        ("WIFI","Wi-Fi"),
        ("RF","RF"),
        ("LORA","LoRa"),
        ("NFC","NFC"),
        ("RS232","RS232"),
        ("RS485","RS485"),
        ("SERIAL","Serial"),
        ("UNIX_SOCKET","Unix Socket"),
        ("SMB","SMB"),
        ("RPC","RPC"),
        ("DCOM","DCOM"),
    ]

    DEFAULT_PORT = [
        ("",""),
    ]

    SECURE_PORT = [
        ("22","22 (SSH/SFTP)"),
        ("443","443 (HTTPS/TLS)"),
        ("465","465 (SMTPS)"),
        ("636","636 (LDAPS)"),
        ("853","853 (DNS over TLS)"),
        ("989","989 (FTPS Data)"),
        ("990","990 (FTPS Control)"),
        ("992","992 (Secure Telnet)"),
        ("993","993 (IMAPS)"),
        ("995","995 (POP3S)"),
        ("1813","1813 (RADIUS Accounting)"),
        ("4500","4500 (IPsec NAT-T)"),
        ("51820","51820 (WireGuard)"),
        ("VENDER_SPECIFIC","Vendor Specific"),
        ("CARRIER_ASSIHN","Carrier Assigned"),
    ]

    PROTOCOL_TYPE = [
        ("APPLICATION", "Application Protocol"),
        ("NETWORK", "Network Protocol"),
        ("TRANSPORT", "Transport Protocol"),
        ("SESSION", "Session Protocol"),
        ("SECURITY", "Security Protocol"),
        ("AUTHENTICATION", "Authentication Protocol"),
        ("AUTHORIZATION", "Authorization Protocol"),
        ("REMOTE_ACCESS", "Remote Access Protocol"),
        ("FILE_TRANSFER", "File Transfer Protocol"),
        ("DIRECTORY_SERVICE", "Directory Service Protocol"),
        ("MESSAGING", "Messaging Protocol"),
        ("API", "API Protocol"),
        ("RPC", "RPC Protocol"),
        ("WEB_SERVICE", "Web Service Protocol"),
        ("COMMUNICATION", "Communication Protocol"),
        ("INDUSTRIAL_CONTROL", "Industrial Control Protocol"),
        ("INDUSTRIAL_AUTOMATION", "Industrial Automation Protocol"),
        ("PLC_COMMUNICATION", "PLC Communication Protocol"),
        ("BUILDING_AUTOMATION", "Building Automation Protocol"),
        ("AUTOMOTIVE_COMMUNICATION", "Automotive Communication Protocol"),
        ("IOT", "IoT Protocol"),
        ("WIRELESS_COMMUNICATION", "Wireless Communication Protocol"),
        ("ROUTING", "Routing Protocol"),
        ("NETWORK_MANAGEMENT", "Network Management Protocol"),
        ("NAME_RESOLUTION", "Name Resolution Protocol"),
        ("CONFIGURATION", "Configuration Protocol"),
        ("TIME_SYNCHRONIZATION", "Time Synchronization Protocol"),
        ("VPN", "VPN Protocol"),
        ("TUNNELING", "Tunneling Protocol"),
        ("STREAMING", "Streaming Protocol"),
        ("PUSH_NOTIFICATION", "Push Notification Protocol"),
        ("MIDDLEWARE", "Middleware Protocol"),
        ("SMART_CARD", "Smart Card Protocol"),
        ("PAYMENT", "Payment Protocol"),
        ("CRYPTOGRAPHIC", "Cryptographic Protocol"),
        ("DEBUGGING", "Debugging Protocol"),
        ("HARDWARE_INTERFACE", "Hardware Interface Protocol"),
        ("SERIAL_COMMUNICATION", "Serial Communication Protocol"),
        ("BUS_COMMUNICATION", "Bus Communication Protocol"),
        ("PROPRIETARY", "Proprietary Protocol"),
    ]

    COMMUNICATION_MODEL = [
        ("CLIENT_SERVER","Client Server"),
        ("PEER_TO_PEER","Peero-to-Peer"),
        ("PUBLISH_SUBSCR","Publish-Subscribe"),
        ("REQU_RESPO","Request-Response"),
        ("MASTER_SLAVE","Master-Slave"),
        ("BUS_COMM","Bus Communication"),
        ("BROADCAST","Broadcast"),
        ("MULTICAST","Multicast"),
        ("UNICAST","Unicast"),
        ("MESH_NETWORK","Mesh Network")
    ]

    USED_IN = [
        ("WEB_APP","Web Applications"),
        ("WEB_SERVER","Web Services"),
        ("REST_API","REST APIs"),
        ("GRAPHQL","GraphQL APIs"),
        ("MICROSERVICES","Microservices"),
        ("ENTERPRISE_NETWORK","Enterprise Networks"),
        ("MOBILE_APP","Mobile Applications"),
        ("DESKTOP_APP","Desktop Applications"),
        ("IOT","IoT"),
        ("EMBEDDED_SYS","Embedded Systems"),
        ("SCADA","SCADA"),
        ("INDUSTRIAL_AUTO","Industrial Automation"),
        ("CLOUD","Cloud"),
        ("AUTOMOTIVE","Automotive"),
        ("BUILDING_AUTO","Building Automation"),
        ("PYMENT_SYS","Payment Systems"),
        ("VOIP","VoIP"),
        ("VPN","VPN"),
    ]

    USED_BY = [
        ("BROWSER","Browser"),
        ("WEB_SERVER","Web Server"),
        ("APP_SERVER","Application Server"),
        ("DATABASE_SERVER","Database Server"),
        ("DESKTOP","Desktop"),
        ("LAPTOP","Laptop"),
        ("MOBILE","Mobile"),
        ("FIREWALL","Firewall"),
        ("ROUTER","Router"),
        ("SWITCH","Switch"),
        ("PLC","PLC"),
        ("RTU","RTU"),
        ("ECU","ECU"),
        ("IOT_GATEWAY","IoT Gateway"),
        ("IOT_SENSOR","IoT Sensor"),
        ("CLOUD_SERVER","Cloud Server"),
        ("SMART_CARD","Smart Card"),
        ("RFID_READER","RFID Reader"),
        ("PYMENT_TERMINAL","Payment Terminal"),
    ]

    DATA_FORMAT = [
        ("TEXT","Text"),
        ("BINARY","Binary"),
        ("JSON","JSON"),
        ("XML","XML"),
        ("YAML","YAML"),
        ("CSV","CSV"),
        ("ASN_1","ASN.1"),
        ("PROTOCOL_BUFFERS","Protocol Buffers"),
        ("RAW_BYTES","Raw Bytes"),
        ("FRAMES","Frames"),
    ]

    PACKET_STRU = [
        ("HEADER_PAYLOAD","Header + Payload"),
        ("REQU_RESP","Request / Response"),
        ("FRAME_BASED","Frame Based"),
        ("BINARY_FRAME","Binary Frame"),
        ("BINARY_MSG","Binary Message"),
        ("XML_ENVELOPE","XML Envelope"),
        ("JSON_MSG","JSON Message"),
        ("CUSTOM_FORMAR","Custom Format"),
    ]

    PROTOCOL_AUTHENTICATION = [
        ("BASIC","Basic"),
        ("DIGEST","Digest"),
        ("NTLM","NTLM"),
        ("KERBEROS","Kerberos"),
        ("OAUTH_2.0","OAuth 2.0"),
        ("JWT","JWT"),
        ("OPENID_CONN","OpenID Connect"),
        ("SAML","SAML"),
        ("API_KEY","API Key"),
        ("CERTIFICATE","Certificate"),
        ("USERNAME_PASS","Username/Password"),
        ("TOKEN","Token Based"),
        ("MFA","MFA"),
    ]

    ENCRYPTION = [
        ("SSL","SSL"),
        ("TLS","TLS"),
        ("TLS_1.2","TLS 1.2"),
        ("TLS_1.3","TLS 1.3"),
        ("DTLS","DTLS"),
        ("IP_SEC","IPsec"),
        ("AES","AES"),
        ("RSA","RSA"),
        ("ECC","ECC"),
        ("CHACHA20","ChaCha20"),
    ]

    STANDARDS_RFC = [
        ("RFC","RFC"),
        ("IEEE","IEEE"),
        ("ISO","ISO"),
        ("IEC","IEC"),
        ("IETF","IETF"),
        ("W3C","W3C"),
        ("BLE_SIG","Bluetooth SIG"),
        ("OASIS","OASIS"),
        ("CAN_IN_AUTO","CAN in Automation"),
        ("OPC_FOUNDATION","OPC Foundation"),
        ("NIST","NIST"),
    ]

    protocol_id = models.AutoField(primary_key=True)
    protocol_name = models.CharField(max_length=100, unique=True)
    protocol_port = models.CharField(max_length=20, blank=True, null=True)
    protocol_category = models.CharField( max_length=30, choices=CATEGORY_CHOICES )
    protocol_type = models.CharField( max_length=30, choices=PROTOCOL_TYPE )
    protocol_desc = models.TextField(blank=True)

    osi_layer = models.CharField( max_length=30, choices=OSI_LAYER_CHOICES )
    transport_protocol = models.CharField( max_length=30, choices=TRANSPORT_PROTOCOL_CHOICES )
    default_ports = models.CharField( max_length=30, choices=DEFAULT_PORT, blank=True, null=True)
    serial_port = models.CharField(max_length=20, blank=True, null=True)

    secure_ports = models.CharField(max_length=30, choices=SECURE_PORT)
    communication_model = models.CharField( max_length=30, choices=COMMUNICATION_MODEL )
    used_in = models.CharField( max_length=30, choices=USED_IN)
    used_by = models.CharField( max_length=30, choices=USED_BY)
    purpose = models.TextField(blank=True)
    data_format = models.CharField( max_length=30, choices=DATA_FORMAT)
    packet_structure = models.CharField( max_length=30, choices=PACKET_STRU)
    protocol_authentication = models.CharField( max_length=30, choices=PROTOCOL_AUTHENTICATION)
    emcryption = models.CharField(max_length=30, choices=ENCRYPTION)
    standard_rfc = models.CharField(max_length=30, choices=STANDARDS_RFC)

    class Meta:
        db_table = "Protocols"
        ordering = ["protocol_name"]

    def __str__(self):
        return self.protocol_name

class ToolParameter(models.Model):

    PARAMETER_TYPES = (
        ("text", "Text"),
        ("number", "Number"),
        ("select", "Select"),
        ("checkbox", "Checkbox"),
        ("file", "File"),
    )

    tool = models.ForeignKey(
        Tools,
        on_delete=models.CASCADE,
        related_name="parameters"
    )

    parameter_name = models.CharField(max_length=100)
    parameter_label = models.CharField(max_length=100)

    parameter_type = models.CharField(
        max_length=20,
        choices=PARAMETER_TYPES
    )

    placeholder = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    default_value = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    options = models.TextField(
        blank=True,
        null=True,
        help_text="Comma separated values"
    )

    required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.tool.tool_name} - {self.parameter_label}"