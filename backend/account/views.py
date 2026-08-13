
import base64
import datetime
import io
import os
import subprocess
from django.db import IntegrityError
from django.db.models import Q
from django.http import JsonResponse
import qrcode
import pyotp

from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from account.serialization import (
    ProjectSerializer,
    ToolParameterSerializer,
)

# from backend.backend import settings
from django.conf import settings

from .models import (
    Project,
    ProjectAssignment, 
    Protocols, 
    Reports, 
    Stages,
    SuiteStageMapping, 
    Suites, 
    ToolMapping, 
    ToolParameter, 
    Tools, 
    User
)

from rest_framework import status
from django.shortcuts import get_object_or_404


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Email not found"
            },
            status=404
        )

    user = authenticate(
        request,
        username=user_obj.username,
        password=password
    )

    if user is None:
        return Response(
            {
                "success": False,
                "message": "Invalid credentials"
            },
            status=401
        )

    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save(
            update_fields=["totp_secret"]
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "success": True,
            "user_id": user.id,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }
    )


def generate_qr_code(user):
    if not user.totp_secret:
        user.generate_totp_secret()
        user.save()

    totp = pyotp.TOTP(user.totp_secret)

    uri = totp.provisioning_uri(
        name=user.email,
        issuer_name="CyberToolKit"
    )

    qr = qrcode.make(uri)

    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")

    return base64.b64encode(buffer.getvalue()).decode()


@api_view(["POST"])
@permission_classes([AllowAny])
def setup_mfa(request):
    """Public endpoint - No authentication required"""
    user_id = request.data.get("user_id")

    if not user_id:
        return Response({
            "success": False,
            "message": "user_id required"
        }, status=400)

    try:
        user = User.objects.get(id=user_id)
        qr = generate_qr_code(user)

        return Response({
            "success": True,
            "qr_code": qr
        })

    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=404)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_totp(request):
    """Public endpoint - No authentication required"""
    user_id = request.data.get("user_id")
    code = request.data.get("totp")
    
    if not user_id or not code:
        return Response({
            "success": False,
            "message": "user_id and totp are required"
        }, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        
        if not user.totp_secret:
            return Response({
                "success": False,
                "message": "TOTP not set up for this user"
            }, status=400)
        
        totp = pyotp.TOTP(user.totp_secret)
        
        if not code:
            return Response({
                "success": False,
                "message": "Please enter OTP"
            }, status=400)
        
        if not totp.verify(code, valid_window=1):
            return Response({
                "success": False,
                "message": "Invalid OTP"
            }, status=400)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "success": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "username": user.username,
        })
        
    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=404)
    
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):

    user = request.user

    return Response({
        "user_id": user.user_id,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "contact": user.contact,
        "organization": user.organization,
        "location": user.location,
        "department": user.department,
        "account_status": user.account_status
    })


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):

    user = request.user
    data = request.data

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.contact = data.get("contact", user.contact)
    user.organization = data.get("organization", user.organization)
    user.location = data.get("location", user.location)
    user.department = data.get("department", user.department)

    user.save()

    return Response({
        "message": "Profile updated successfully"
    })


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not user.check_password(current_password):
        return Response({
            "error":"Current password is incorrect."
        }, status=400)

    if new_password != confirm_password:
        return Response({
            "error":"New passwords do not match."
        }, status=400)

    user.set_password(new_password)
    user.save()

    return Response({
        "message":"Password Changed Successfully"
    })

# @api_view(['POST'])
# create_log(
#     event_id = 1001,
#     event_name = "Login Successfull",
#     level = "INFO",
#     unique_info = User.email,
#     user = User.username
# )


@api_view(['GET'])
@permission_classes([AllowAny])
def master_dashboard(request):
    return Response({
        "message": "Welcome to Master Dashboard"
    })

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_creation(request):

    data = request.data
    role = data.get("role")

    try:
        if role == "CUSTOMER":
            user = User.objects.create_user(
                username=data.get("email"),
                email=data.get("email"),
                password="default123",
                role="CUSTOMER",
                organization=data.get("organization"),
                location=data.get("location"),
                # email=data.get("email"),
                contact_person=data.get("contact_person"),
                contact_person_email=data.get("contact_person_email"),
                designation=data.get("designation"),
                account_status=data.get("account_status", "ACTIVE"),
            )
        else:
            user = User.objects.create_user(
                username=data.get("email"),
                email=data.get("email"),
                password="default123",
                role=role,
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                contact=data.get("contact"),
                organization=data.get("organization"),
                location=data.get("location"),
                department=data.get("department"),
                account_status=data.get("account_status", "ACTIVE"),
            )
        return Response(
            {
                "message": "User created successfully",
                "user_id": user.user_id,
            },
            status=status.HTTP_201_CREATED,
        )

    except IntegrityError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def customer_view(request):
    customers = User.objects.filter(role="CUSTOMER")

    data = []

    for user in customers:
        data.append({
            "user_id": user.user_id,
            "id": user.id,
            "organization": user.organization,
            "email": user.email,
            "location": user.location,
            "contact_person": user.contact_person,
            "contact_person_email": user.contact_person_email,
            "account_status": user.account_status
        })

    return Response(data)
 
@api_view(["GET"])
@permission_classes([AllowAny])
def user_view(request):
    users = User.objects.all()

    data = []

    for user in users:
        data.append({
            "user_id": user.user_id,
            "role": user.role,

            "first_name": user.first_name,
            "last_name": user.last_name,

            "email": user.email,
            "contact_person": user.contact_person,
            "contact_person_email": user.contact_person_email,
            "designation": user.designation,

            "email": user.email,
            "contact": user.contact,
            "organization": user.organization,
            "location": user.location,
            "department": user.department,
            "account_status": user.account_status,
        })

    return Response(data)

@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        user.delete()

        return Response({
            "message": "User deleted !!"
        })
    
    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        }, status=404)


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        data = request.data

        if user.role == "CUSTOMER":
            user.organization = data.get("organization", user.organization)
            user.email = data.get("email", user.email)
            user.location = data.get("location", user.location)
            user.contact_person = data.get("contact_person", user.contact_person)
            user.contact_person_email = data.get(
                "contact_person_email",
                user.contact_person_email
            )
            user.designation = data.get("designation", user.designation)

            if "email" in data:
                user.username = user.email
                user.email = user.email

        else:
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.contact = data.get("contact", user.contact)
            user.email = data.get("email", user.email)
            user.organization = data.get("organization", user.organization)
            user.location = data.get("location", user.location)
            user.department = data.get("department", user.department)

            if "email" in data:
                user.username = user.email

        user.save()

        return Response({
            "message": "User Updated Successfully!!"
        })

    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        }, status=404)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def project_creation(request):
    try:
        data = request.data

        project = Project.objects.create(
            project_name=data.get("project_name"),
            project_type=data.get("project_type"),
            customer_id=data.get("customer"),
            manager_id=data.get("manager"),
            project_desc=data.get("project_desc"),
            priority=data.get("priority"),
            status="ASSIGNED_PENDING",
            start_date=data.get("start_date"),
            deadline=data.get("deadline"),
            progress=data.get("progress", 0),
        )

        Reports.objects.create(
            project=project,
            report_status="PENDING"
        )

        return Response({
            "message":"Project and Report created successfully",
            "project_id":project.project_id
        },status=201)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=400)


@api_view(["GET"])
@permission_classes([AllowAny])
def project_view(request):
    projects = Project.objects.select_related(
        "customer",
        "manager"
    )

    data = []

    for project in projects:
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "priority": project.priority,
            "status": project.status,
            "start_date":project.start_date,
            "deadline": project.deadline,

            "customer": f"{project.customer.organization}",
            "manager": f"{project.manager.first_name} {project.manager.last_name}",
            "assigned_by": f"{project.manager.first_name} {project.manager.last_name}",
        })

    def save(self, *args, **kwargs):
        if not self.project_id:
            last_project = Project.objects.order_by("-id").first()

            if last_project:
                last_number = int(last_project.project_id.replace("PR", ""))
                new_number = last_number + 1
            else:
                new_number = 1

            self.project_id = f"PR{new_number:03d}"

        super().save(*args, **kwargs)

    return Response(data)

PROJECT_TYPE_TO_SUITE_CODE = {
    "WEBAPP": "WEB",
    "MOBILE": "MOBILE",
    "NETWORK": "NETWORK",
    "IOT": "IOT",
    "EMBEDDED": "EMBEDDED",
    "RADIO": "RADIO",
    "THICK": "THICK_CLIENT",
    "SOURCE": "SOURCE_CODE",
}

@api_view(['GET'])
@permission_classes([AllowAny])
def suites(request):
    suites = Suites.objects.all()

    name = request.GET.get("name")

    if name:
        suite_code = PROJECT_TYPE_TO_SUITE_CODE.get(name, name)
        suites = suites.filter(
            Q(suite_code__iexact=suite_code) | Q(suite_name__iexact=suite_code)
        )

    data = []

    for suite in suites:
        data.append({
            "id":suite.id,
            "suite_id": suite.suite_id,
            "suite_name": suite.suite_name,
            "suite_code": suite.suite_code,
            "std_follows": suite.std_follows,
            "suite_desc": suite.suite_desc,
        })

    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def suite_create(request):
    data = request.data

    suite = Suites.objects.create(
        suite_id=data.get("suite_id"),
        suite_name=data.get("suite_name"),
        suite_code=data.get("suite_code"),
        std_follows=data.get("std_follows"),
        suite_desc=data.get("suite_desc"),
    )

    return Response({
        "message": "Suite created successfully",
        "id": suite.id,
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def stages(request):

    suite_id = request.GET.get("suite")

    if not suite_id:
        return Response([])

    mappings = SuiteStageMapping.objects.filter(
        suite_id=suite_id
    ).select_related("stage")

    data = []

    for mapping in mappings:
        data.append({
            "id": mapping.stage.id,
            "stage_id": mapping.stage.stage_id,
            "stage_name": mapping.stage.stage_name,
            "stage_order": mapping.stage.stage_order,
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def protocols(request):
    protocols = Protocols.objects.all()

    data = []

    for protocol in protocols:
        data.append({
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.protocol_name,
            "protocol_category": protocol.protocol_category,
            "protocol_type": protocol.protocol_type,
            "protocol_desc": protocol.protocol_desc,
            
            "osi_layer": protocol.osi_layer,
            "transport_protocol": protocol.transport_protocol,
            "default_ports": protocol.default_ports,
            "secure_ports": protocol.secure_ports,
            "communication_model": protocol.communication_model,
            
            "used_in": protocol.used_in,
            "used_by": protocol.used_by,
            "purpose": protocol.purpose,
            "data_format": protocol.data_format,
            "packet_structure": protocol.packet_structure,
            "protocol_authentication": protocol.protocol_authentication,
            "encryption": protocol.emcryption,
            "standard_rfc": protocol.standard_rfc,
        })
    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def protocol_creation(request):

    data = request.data

    protocol = Protocols.objects.create(
        protocol_name=data.get("protocol_name"),
        protocol_category=data.get("protocol_category"),
        protocol_type=data.get("protocol_type"),
        protocol_desc=data.get("protocol_desc"),

        osi_layer=data.get("osi_layer"),
        transport_protocol=data.get("transport_protocol"),

        default_ports=data.get("default_ports"),
        secure_ports=data.get("secure_ports"),

        communication_model=data.get("communication_model"),
        used_in=data.get("used_in"),
        used_by=data.get("used_by"),

        purpose=data.get("purpose"),
        data_format=data.get("data_format"),
        packet_structure=data.get("packet_structure"),
        protocol_authentication=data.get("protocol_authentication"),
        emcryption=data.get("emcryption"),
        standard_rfc=data.get("standard_rfc"),
    )
    
    for protocol in protocols:

        Protocols.objects.get_or_create(
            protocol_name=protocol[0],
            defaults={
                "protocol_category": protocol[1],
                "osi_layer": protocol[2],
                "transport_protocol": protocol[3],
                "default_ports": protocol[4],
                "secure_ports": protocol[5],
                "protocol_type": protocol[6],
                "communication_model": protocol[7],
                "used_in": protocol[8],
                "used_by": protocol[9],
                # "purpose": protocol[10],
                "default_ports": protocol[11],
                "packet_structure": protocol[12],
                "protocol_authentication": protocol[13],
                "emcryption": protocol[14],
                "standard_rfc": protocol[15],
                "protocol_desc": protocol[10],
            }
        )

    print("Protocol Inserted successfully")

    return Response({
        "message":"Protocol created successfully",
        "protocol_id":protocol.protocol_id
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def protocols_by_category(request):
    category = request.GET.get("category")

    protocols = Protocols.objects.filter(
        protocol_category=category
    )

    data = []

    for protocol in protocols:
        data.append({
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.protocol_name
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_details(request, id):

    protocol = get_object_or_404( Protocols, protocol_id=id )

    return Response({
        "protocol_id": protocol.protocol_id,
        "protocol_name": protocol.protocol_name,
        "protocol_category": protocol.protocol_category,
        "protocol_type": protocol.protocol_type,
        "protocol_desc": protocol.protocol_desc,

        "osi_layer": protocol.osi_layer,
        "transport_protocol": protocol.transport_protocol,
        "default_ports": protocol.default_ports,
        "secure_ports": protocol.secure_ports,

        "communication_model": protocol.communication_model,
        "used_in": protocol.used_in,
        "used_by": protocol.used_by,

        "purpose": protocol.purpose,

        "data_format": protocol.default_ports,
        "packet_structure": protocol.packet_structure,
        "protocol_authentication": protocol.protocol_authentication,
        "encryption": protocol.emcryption,
        "standard_rfc": protocol.standard_rfc,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def reports(request):
    reports = Reports.objects.select_related('project').all()
    
    print(f"Total reports found: {reports.count()}") 

    data = []
    for report in reports:
        data.append({
            "report_id": report.report_id,
            "report_status": report.report_status,
            "project_id": report.project.project_id,
            "project_name": report.project.project_name,
            "priority": report.project.priority,
            "status": report.project.status,
        })
    return Response(data)

def get_choice_data(choices):
    return [
        {
            "id": index + 1,
            "value": item[0],
            "name": item[1]
        }
        for index, item in enumerate(choices)
    ]

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_categories(request):
    data = get_choice_data(
        Protocols.CATEGORY_CHOICES
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_types(request):
    data = get_choice_data(
        Protocols.PROTOCOL_TYPE
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def osi_layers(request):
    data = get_choice_data(
        Protocols.OSI_LAYER_CHOICES
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def transport_protocols(request):
    data = []
    for index, (value, name) in enumerate(
        Protocols.TRANSPORT_PROTOCOL_CHOICES
    ):
        data.append({
            "id": index,
            "value": value,
            "name": name
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def communication_models(request):
    data = []
    for index, (value, name) in enumerate(
        Protocols.COMMUNICATION_MODEL
    ):
        data.append({
            "id": index,
            "value": value,
            "name": name
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def used_in(request):
    data = get_choice_data(
        Protocols.USED_IN
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def used_by(request):
    data = get_choice_data(
        Protocols.USED_BY
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def data_format(request):
    data = get_choice_data(
        Protocols.DATA_FORMAT
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_authentication(request):
    data = get_choice_data(
        Protocols.PROTOCOL_AUTHENTICATION
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def encryption(request):
    data = get_choice_data(
        Protocols.ENCRYPTION
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def standard_rfc(request):
    data = get_choice_data(
        Protocols.STANDARDS_RFC
    )
    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tools(request):
    suite_id = request.GET.get("suite")
    stage_id = request.GET.get("stage")

    # If no suite/stage provided, return ALL tools
    if not suite_id or not stage_id:
        all_tools = Tools.objects.all()
        data = []
        for tool in all_tools:
            # Get mapping for this tool if exists
            mapping = ToolMapping.objects.filter(tool=tool).first()
            data.append({
                "id": tool.id,
                "tool_id": tool.tool_id,
                "tool_name": tool.tool_name,
                "tool_category": tool.tool_category,
                "tool_desc": tool.tool_desc,
                "tool_status": tool.tool_status,
                "suite": mapping.suite.suite_name if mapping and mapping.suite else "N/A",
                "stage": mapping.stage.stage_name if mapping and mapping.stage else "N/A",
            })
        return Response(data)

    # Original logic for filtered tools
    mappings = ToolMapping.objects.filter(
        suite_id=suite_id,
        stage_id=stage_id,
        tool__tool_status=True
    ).select_related("tool", "suite", "stage")
    
    data = []
    for item in mappings:
        data.append({
            "id": item.tool.id,
            "tool_id": item.tool.tool_id,
            "tool_name": item.tool.tool_name,
            "tool_category": item.tool.tool_category,
            "tool_desc": item.tool.tool_desc,
            "tool_status": item.tool.tool_status,
            "suite": item.suite.suite_name if item.suite else suite_id,
            "stage": item.stage.stage_name if item.stage else stage_id,
        })
    return Response(data)

@api_view(["POST"])
@permission_classes([AllowAny])
def tools_create(request):

    tool = Tools.objects.create(
        tool_name=request.data.get("tool_name"),
        tool_category=request.data.get("tool_category"),
        tool_desc=request.data.get("tool_desc"),
        tool_status=request.data.get("tool_status", True)
    )

    suite_id = request.data.get("suite")
    stage_id = request.data.get("stage")

    if suite_id and stage_id:
        ToolMapping.objects.create(
            tool=tool,
            suite_id=suite_id,
            stage_id=stage_id
        )

    return Response(
        {
            "message":"Tool Added Successfully",
            "tool_id":tool.tool_id
        },
        status=201
    )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def save_output(request):
    """Save command output to a file"""
    try:
        filename = request.data.get("filename")
        content = request.data.get("content")
        
        if not filename or not content:
            return Response(
                {"error": "Filename and content are required"},
                status=400
            )
        
        # Ensure .txt extension
        if not filename.endswith('.txt'):
            filename = filename + '.txt'
        
        # Create directory if it doesn't exist
        output_dir = os.path.join(settings.BASE_DIR, "outputs")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Add timestamp to filename to avoid overwriting
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        final_filename = f"{name}_{timestamp}{ext}"
        filepath = os.path.join(output_dir, final_filename)
        
        # Write content to file
        with open(filepath, 'w') as f:
            f.write(content)
        
        return Response({
            "message": "File saved successfully",
            "filepath": filepath,
            "filename": final_filename
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=500
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard(request):
    return Response({
        "message": "Welcome to Admin Dashboard"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def supportadmin_dashboard(request):
    return Response({
        "message": "Welcome to Support Admin Dashboard"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def testmanager_dashboard(request):
    return Response({
        "message": "Welcome to Test Manager Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testmanager_creation(request):
    managers = User.objects.filter(role="TEST_MANAGER")

    data = list(
        managers.values(
            "id",
            "first_name",
            "last_name"
        )
    )

    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manager_projects(request):
    if request.user.role != "TEST_MANAGER":
        return Response(
            {"error": "Access Denied"},
            status=403
        )

    projects = Project.objects.filter(
        manager=request.user,
        status="ASSIGNED_PENDING"
    ).select_related("customer")

    data = []

    for project in projects:
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "customer": project.customer.organization,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "testing_stage": project.testing_stage,
            "manager":project.manager
        })

    return Response(data)

@api_view(['POST', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def assign_tester(request, project_id):
    try:
        project = Project.objects.get(project_id=project_id, manager=request.user)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    tester_id = request.data.get("tester_id") or request.data.get("tester")
    if not tester_id:
        return Response({"error": "tester_id or tester is required"}, status=400)

    try:
        tester = User.objects.get(id=tester_id, role="TESTER")
    except User.DoesNotExist:
        return Response({"error": "Tester not found"}, status=404)

    if ProjectAssignment.objects.filter(project=project, tester=tester).exists():
        return Response({"error": "Tester already assigned to this project"}, status=400)

    ProjectAssignment.objects.create(
        project=project,
        tester=tester,
        assigned_by=request.user
    )
    project.status = "TESTER_ASSIGNED"
    project.save()

    return Response({
        "message": "Tester assigned successfully",
        "project_id": project.project_id,
        "tester": tester.username,
        "status": project.status
    }, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def tester_dashboard(request):
    return Response({
        "message": "Welcome to Tester Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_projects(request):

    if request.user.role != "TESTER":
        return Response(
            {
                "error":"Access Denied"
            },
            status=403
        )

    assignments = ProjectAssignment.objects.filter(
        tester=request.user
    ).select_related(
        "project",
        "assigned_by"
    )

    data=[]

    for assignment in assignments:
        project = assignment.project
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "assigned_by": assignment.assigned_by.username,
            # "testing_stage": project.testing_stage
            "current_stage": project.current_stage
        })
    return Response(data)

@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_project_stage(request, project_id):
    stage = request.data.get("stage")
    project = Project.objects.get(
        project_id=project_id
    )

    valid_codes = [code for code, _ in Project.STAGE_CHOICES]

    if stage not in valid_codes:
        try:
            stage_obj = Stages.objects.get(stage_id=stage)
            stage = Project.STAGE_CHOICES[stage_obj.stage_order - 1][0]
        except (Stages.DoesNotExist, IndexError):
            pass

    project.current_stage = stage
    project.save()

    return Response({
        "message":"Stage updated",
        "current_stage":project.current_stage
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_project_detail(request, project_id):

    # print("PROJECT ID:", project_id)
    # print("USER:", request.user)

    try:
        assignment = ProjectAssignment.objects.select_related(
            "project",
            "tester",
            "assigned_by"
        ).get(
            project__project_id=project_id,
            tester=request.user
        )

        project = assignment.project

        # print("PROJECT FOUND:", project)

        data = {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "customer": str(project.customer),
            "manager": str(project.manager),
            "priority": project.priority,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "status": project.status,
            "project_type": project.project_type,
            "current_stage": project.current_stage
        }
        return Response(data)

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response(
            {
                "error": str(e)
            },
            status=500
        )

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_list(request):
    if request.user.role != "TEST_MANAGER":
        return Response(
            {"error":"Access Denied"},
            status=403
        )
    testers = User.objects.filter(
        role="TESTER"
    )

    data=[]

    for tester in testers:
        data.append({
            "id": tester.id,
            "first_name": tester.first_name,
            "last_name": tester.last_name,
            "username": tester.username,
            "user_id": tester.user_id
        })

    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_projects(request):

    projects = Project.objects.filter(
        manager=request.user
    )

    serializer = ProjectSerializer(
        projects,
        many=True
    )

    return Response(serializer.data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testing(request, project_id):
    if request.user.role != "TESTER":
        return Response(
            {"error": "Access Denied"},
            status=403
        )

    try:
        assignment = ProjectAssignment.objects.select_related(
            "project",
            "assigned_by"
        ).get(
            project__project_id=project_id,
            tester=request.user
        )
    except ProjectAssignment.DoesNotExist:
        return Response(
            {"error": "Project not assigned"},
            status=404
        )

    project = assignment.project

    return Response({
        "project": {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "customer": project.customer.organization,
            "manager": project.manager.username,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "testing_stage": project.testing_stage,
            "progress": project.progress,
            "current_stage": project.current_stage
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def customer_dashboard(request):
    return Response({
        "message": "Welcome to Customer Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def customer_creation(request):
    customers = User.objects.filter(role="CUSTOMER")

    data = list(
        customers.values(
            "id",
            "first_name",
            "last_name"
        )
    )
    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def customer_projects(request):
    
    if request.user.role != "CUSTOMER":
        return Response(
            {"error": "Access Denied. Customer access required."},
            status=403
        )
    
    projects = Project.objects.filter(
        customer=request.user
    ).select_related(
        "customer",
        "manager"
    )
    
    data = []
    for project in projects:
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "project_desc": project.project_desc,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "progress": project.progress,
            "current_stage": project.current_stage,

            "manager": {
                "id": project.manager.id 
                    if 
                        project.manager 
                    else 
                        None,
                "name": 
                    f"{project.manager.first_name} {project.manager.last_name}" 
                    if 
                        project.manager 
                    else 
                    "Not Assigned",
                "email": project.manager.email if project.manager else None
            } if project.manager else None,

            "customer": {
                "id": project.customer.id,
                "organization": project.customer.organization,
                "email": project.customer.email
            } if project.customer else None,
            "reports": {
                "status": "PENDING"
            }
        })
    
    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def run_amass(request):

    data = request.data

    mode = data.get("mode")
    domain = data.get("domain")
    organization = data.get("organization")
    asn = data.get("asn")
    cidr = data.get("cidr")
    wordlist = data.get("wordlist")
    output = data.get("output")

    ip = data.get("ip")
    brute = data.get("brute")
    alterations = data.get("alterations")
    silent = data.get("silent")

    cmd = ["amass"]

    if mode in ["passive", "active"]:
        cmd.append("enum")
        if mode == "passive":
            cmd.append("-passive")
        if mode == "active":
            cmd.append("-active")
        if brute:
            cmd.append("-brute")
        if alterations:
            cmd.append("-alts")
        if ip:
            cmd.append("-ip")
        if silent:
            cmd.append("-silent")
        if wordlist:
            cmd.extend(["-w", wordlist])
        if output:
            cmd.extend(["-o", output])
        cmd.extend(["-d", domain])

    elif mode == "whois":
        cmd = [
            "amass",
            "intel",
            "-whois",
            "-d",
            domain,
        ]

    elif mode == "organization":
        cmd = [
            "amass",
            "intel",
            "-org",
            organization,
        ]

    elif mode == "asn":
        cmd = [
            "amass",
            "intel",
            "-asn",
            str(asn),
        ]

    elif mode == "cidr":
        cmd = [
            "amass",
            "intel",
            "-cidr",
            cidr,
        ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600
        )

        return Response({
            "status": "success",
            "command": " ".join(cmd),
            "output": result.stdout,
            "error": result.stderr
        })

    except subprocess.TimeoutExpired:
        return Response({
            "status": "failed",
            "output": "",
            "error": "Scan Timed Out"
        })

    except Exception as e:
        return Response({
            "status": "failed",
            "output": "",
            "error": str(e)
        })


@api_view(["GET"])
@permission_classes([AllowAny])
def parameter_list(request):
    tool = request.GET.get("tool")
    parameters = ToolParameter.objects.filter(
        tool_id=tool
    ).order_by(
        "display_order"
    )

    return Response(
        ToolParameterSerializer(
            parameters,
            many=True
        ).data
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def evidence(request):
    return Response({
        "message": "Welcome to Evidence Management"
    })

# import base64
# import io
# import subprocess
# from django.db import IntegrityError
# from django.http import JsonResponse
# import qrcode
# import pyotp

# from django.contrib.auth import authenticate
# from rest_framework.permissions import IsAuthenticated

# from rest_framework_simplejwt.authentication import JWTAuthentication

# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.decorators import api_view, authentication_classes, permission_classes
# from rest_framework.response import Response

# from account.serialization import (
#     ProjectSerializer,
#     StageSerializer,
#     SuiteSerializer,
#     ToolParameterSerializer,
#     ToolSerializer
# )

# from .models import (
#     Project,
#     ProjectAssignment, 
#     Protocols, 
#     Reports, 
#     Stages,
#     SuiteStageMapping, 
#     Suites, 
#     ToolMapping, 
#     ToolParameter, 
#     Tools, 
#     User
# )

# from rest_framework import status
# from audits.utils import create_log
# from django.shortcuts import get_object_or_404

# from rest_framework_simplejwt.tokens import RefreshToken


# @api_view(["POST"])
# def login(request):
#     email = request.data.get("email")
#     password = request.data.get("password")
#     try:
#         user_obj = User.objects.get(email=email)
#     except User.DoesNotExist:
#         return Response(
#             {
#                 "success": False,
#                 "message": "Email not found"
#             },
#             status=404
#         )

#     user = authenticate(
#         request,
#         username=user_obj.username,
#         password=password
#     )

#     if user is None:
#         return Response(
#             {
#                 "success": False,
#                 "message": "Invalid credentials"
#             },
#             status=401
#         )

#     if not user.totp_secret:
#         user.totp_secret = pyotp.random_base32()
#         user.save(
#             update_fields=["totp_secret"]
#         )

#     refresh = RefreshToken.for_user(user)

#     return Response(
#         {
#             "success": True,
#             "user_id": user.id,
#             "access": str(refresh.access_token),
#             "refresh": str(refresh),
#             "user": {
#                 "id": user.id,
#                 "username": user.username,
#                 "role": user.role
#             }
#         }
#     )

# def generate_qr_code(user):

#     if not user.totp_secret:
#         user.generate_totp_secret()
#         user.save()

#     totp = pyotp.TOTP(user.totp_secret)

#     uri = totp.provisioning_uri(
#         name=user.email,
#         issuer_name="CyberToolKit"
#     )

#     qr = qrcode.make(uri)

#     buffer = io.BytesIO()
#     qr.save(buffer, format="PNG")

#     return base64.b64encode(buffer.getvalue()).decode()


# @api_view(["POST"])
# def setup_mfa(request):
#     user_id = request.data.get("user_id")

#     if not user_id:
#         return Response({
#             "success": False,
#             "message": "user_id required"
#         }, status=400)

#     try:
#         user = User.objects.get(id=user_id)

#         qr = generate_qr_code(user)

#         return Response({
#             "success": True,
#             "qr_code": qr
#         })

#     except User.DoesNotExist:
#         return Response({
#             "success": False,
#             "message": "User not found"
#         }, status=404)
    

# @api_view(["POST"])
# def verify_totp(request):
#     user_id = request.data.get("user_id")
#     code = request.data.get("totp")

#     try:
#         user = User.objects.get(id=user_id)

#         totp = pyotp.TOTP(user.totp_secret)

#         if totp == "":
#             return Response({"message": "Please Enter OTP"})

#         if not totp.verify(code, valid_window=1):
#             return Response({
#                 "success": False,
#                 "message": "Invalid OTP"
#             }, status=400)

#         refresh = RefreshToken.for_user(user)

#         return Response({
#             "success": True,
#             "access": str(refresh.access_token),
#             "refresh": str(refresh),
#             "role": user.role,
#             "username": user.username,
#         })

#     except User.DoesNotExist:
#         return Response({
#             "success": False,
#             "message": "User not found"
#         }, status=404)
    

# @api_view(["GET"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def profile(request):

#     user = request.user

#     return Response({
#         "user_id": user.user_id,
#         "role": user.role,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#         "email": user.email,
#         "contact": user.contact,
#         "organization": user.organization,
#         "location": user.location,
#         "department": user.department,
#         "account_status": user.account_status
#     })


# @api_view(["PUT"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def update_profile(request):

#     user = request.user
#     data = request.data

#     user.first_name = data.get("first_name", user.first_name)
#     user.last_name = data.get("last_name", user.last_name)
#     user.email = data.get("email", user.email)
#     user.contact = data.get("contact", user.contact)
#     user.organization = data.get("organization", user.organization)
#     user.location = data.get("location", user.location)
#     user.department = data.get("department", user.department)

#     user.save()

#     return Response({
#         "message": "Profile updated successfully"
#     })


# @api_view(["PUT"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def change_password(request):

#     user = request.user

#     current_password = request.data.get("current_password")
#     new_password = request.data.get("new_password")
#     confirm_password = request.data.get("confirm_password")

#     if not user.check_password(current_password):
#         return Response({
#             "error":"Current password is incorrect."
#         }, status=400)

#     if new_password != confirm_password:
#         return Response({
#             "error":"New passwords do not match."
#         }, status=400)

#     user.set_password(new_password)
#     user.save()

#     return Response({
#         "message":"Password Changed Successfully"
#     })


# # @api_view(['POST'])
# # create_log(
# #     event_id = 1001,
# #     event_name = "Login Successfull",
# #     level = "INFO",
# #     unique_info = User.email,
# #     user = User.username
# # )


# @api_view(['GET'])
# def master_dashboard(request):
#     return Response({
#         "message": "Welcome to Master Dashboard"
#     })

# @api_view(["POST"])
# def user_creation(request):

#     data = request.data
#     role = data.get("role")

#     try:
#         if role == "CUSTOMER":
#             user = User.objects.create_user(
#                 username=data.get("email"),
#                 email=data.get("email"),
#                 password="default123",
#                 role="CUSTOMER",
#                 organization=data.get("organization"),
#                 location=data.get("location"),
#                 # email=data.get("email"),
#                 contact_person=data.get("contact_person"),
#                 contact_person_email=data.get("contact_person_email"),
#                 designation=data.get("designation"),
#                 account_status=data.get("account_status", "ACTIVE"),
#             )
#         else:
#             user = User.objects.create_user(
#                 username=data.get("email"),
#                 email=data.get("email"),
#                 password="default123",
#                 role=role,
#                 first_name=data.get("first_name"),
#                 last_name=data.get("last_name"),
#                 contact=data.get("contact"),
#                 organization=data.get("organization"),
#                 location=data.get("location"),
#                 department=data.get("department"),
#                 account_status=data.get("account_status", "ACTIVE"),
#             )
#         return Response(
#             {
#                 "message": "User created successfully",
#                 "user_id": user.user_id,
#             },
#             status=status.HTTP_201_CREATED,
#         )

#     except IntegrityError as e:
#         return Response(
#             {"error": str(e)},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     except Exception as e:
#         return Response(
#             {"error": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )

# @api_view(["GET"])
# def customer_view(request):
#     customers = User.objects.filter(role="CUSTOMER")

#     data = []

#     for user in customers:
#         data.append({
#             "user_id": user.user_id,
#             "id": user.id,
#             "organization": user.organization,
#             "email": user.email,
#             "location": user.location,
#             "contact_person": user.contact_person,
#             "contact_person_email": user.contact_person_email,
#             "account_status": user.account_status
#         })

#     return Response(data)
 
# @api_view(["GET"])
# def user_view(request):
#     users = User.objects.all()

#     data = []

#     for user in users:
#         data.append({
#             "user_id": user.user_id,
#             "role": user.role,

#             "first_name": user.first_name,
#             "last_name": user.last_name,

#             "email": user.email,
#             "contact_person": user.contact_person,
#             "contact_person_email": user.contact_person_email,
#             "designation": user.designation,

#             "email": user.email,
#             "contact": user.contact,
#             "organization": user.organization,
#             "location": user.location,
#             "department": user.department,
#             "account_status": user.account_status,
#         })

#     return Response(data)

# @api_view(["DELETE"])
# def delete_user(request, user_id):
#     try:
#         user = User.objects.get(user_id=user_id)
#         user.delete()

#         return Response({
#             "message": "User deleted !!"
#         })
    
#     except User.DoesNotExist:
#         return Response({
#             "error": "User not found"
#         }, status=404)


# @api_view(["PUT"])
# def update_user(request, user_id):
#     try:
#         user = User.objects.get(user_id=user_id)
#         data = request.data

#         if user.role == "CUSTOMER":
#             user.organization = data.get("organization", user.organization)
#             user.email = data.get("email", user.email)
#             user.location = data.get("location", user.location)
#             user.contact_person = data.get("contact_person", user.contact_person)
#             user.contact_person_email = data.get(
#                 "contact_person_email",
#                 user.contact_person_email
#             )
#             user.designation = data.get("designation", user.designation)

#             if "email" in data:
#                 user.username = user.email
#                 user.email = user.email

#         else:
#             user.first_name = data.get("first_name", user.first_name)
#             user.last_name = data.get("last_name", user.last_name)
#             user.contact = data.get("contact", user.contact)
#             user.email = data.get("email", user.email)
#             user.organization = data.get("organization", user.organization)
#             user.location = data.get("location", user.location)
#             user.department = data.get("department", user.department)

#             if "email" in data:
#                 user.username = user.email

#         user.save()

#         return Response({
#             "message": "User Updated Successfully!!"
#         })

#     except User.DoesNotExist:
#         return Response({
#             "error": "User not found"
#         }, status=404)

# @api_view(["POST"])
# def project_creation(request):
#     try:
#         data = request.data

#         project = Project.objects.create(
#             project_name=data.get("project_name"),
#             project_type=data.get("project_type"),
#             customer_id=data.get("customer"),
#             manager_id=data.get("manager"),
#             project_desc=data.get("project_desc"),
#             priority=data.get("priority"),
#             status="ASSIGNED_PENDING",
#             start_date=data.get("start_date"),
#             deadline=data.get("deadline"),
#             progress=data.get("progress", 0),
#         )

#         Reports.objects.create(
#             project=project,
#             report_status="PENDING"
#         )

#         return Response({
#             "message":"Project and Report created successfully",
#             "project_id":project.project_id
#         },status=201)

#     except Exception as e:
#         return Response({
#             "error": str(e)
#         }, status=400)


# @api_view(["GET"])
# def project_view(request):

#     projects = Project.objects.select_related(
#         "customer",
#         "manager"
#     )

#     data = []

#     for project in projects:
#         data.append({
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "project_type": project.project_type,
#             "priority": project.priority,
#             "status": project.status,
#             "deadline": project.deadline,

#             "customer": f"{project.customer.organization}",
#             "manager": f"{project.manager.first_name} {project.manager.last_name}",
#         })

#     def save(self, *args, **kwargs):
#         if not self.project_id:
#             last_project = Project.objects.order_by("-id").first()

#             if last_project:
#                 last_number = int(last_project.project_id.replace("PR", ""))
#                 new_number = last_number + 1
#             else:
#                 new_number = 1

#             self.project_id = f"PR{new_number:03d}"

#         super().save(*args, **kwargs)

#     return Response(data)

# @api_view(['GET'])
# def suites(request):
#     suites = Suites.objects.all()

#     data = []

#     for suite in suites:
#         data.append({
#             "id":suite.id,
#             "suite_id": suite.suite_id,
#             "suite_name": suite.suite_name,
#             "suite_code": suite.suite_code,
#             "std_follows": suite.std_follows,
#             "suite_desc": suite.suite_desc,
#         })

#     return Response(data)

# @api_view(["POST"])
# def suite_create(request):
#     data = request.data

#     suite = Suites.objects.create(
#         suite_id=data.get("suite_id"),
#         suite_name=data.get("suite_name"),
#         suite_code=data.get("suite_code"),
#         std_follows=data.get("std_follows"),
#         suite_desc=data.get("suite_desc"),
#     )

#     return Response({
#         "message": "Suite created successfully",
#         "id": suite.id,
#     })

# @api_view(["GET"])
# def stages(request):

#     suite_id = request.GET.get("suite")

#     if not suite_id:
#         return Response([])

#     mappings = SuiteStageMapping.objects.filter(
#         suite_id=suite_id
#     ).select_related("stage")

#     data = []

#     for mapping in mappings:
#         data.append({
#             "id": mapping.stage.id,
#             "stage_id": mapping.stage.stage_id,
#             "stage_name": mapping.stage.stage_name,
#             "stage_order": mapping.stage.stage_order,
#         })

#     return Response(data)

# @api_view(['GET'])
# def protocols(request):
#     protocols = Protocols.objects.all()

#     data = []

#     for protocol in protocols:
#         data.append({
#             "protocol_id": protocol.protocol_id,
#             "protocol_name": protocol.protocol_name,
#             "protocol_category": protocol.protocol_category,
#             "protocol_type": protocol.protocol_type,
#             "protocol_desc": protocol.protocol_desc,
            
#             "osi_layer": protocol.osi_layer,
#             "transport_protocol": protocol.transport_protocol,
#             "default_ports": protocol.default_ports,
#             "secure_ports": protocol.secure_ports,
#             "communication_model": protocol.communication_model,
            
#             "used_in": protocol.used_in,
#             "used_by": protocol.used_by,
#             "purpose": protocol.purpose,
#             "data_format": protocol.data_format,
#             "packet_structure": protocol.packet_structure,
#             "protocol_authentication": protocol.protocol_authentication,
#             "encryption": protocol.emcryption,
#             "standard_rfc": protocol.standard_rfc,
#         })
#     return Response(data)

# @api_view(["POST"])
# def protocol_creation(request):

#     data = request.data

#     protocol = Protocols.objects.create(
#         protocol_name=data.get("protocol_name"),
#         protocol_category=data.get("protocol_category"),
#         protocol_type=data.get("protocol_type"),
#         protocol_desc=data.get("protocol_desc"),

#         osi_layer=data.get("osi_layer"),
#         transport_protocol=data.get("transport_protocol"),

#         default_ports=data.get("default_ports"),
#         secure_ports=data.get("secure_ports"),

#         communication_model=data.get("communication_model"),
#         used_in=data.get("used_in"),
#         used_by=data.get("used_by"),

#         purpose=data.get("purpose"),
#         data_format=data.get("data_format"),
#         packet_structure=data.get("packet_structure"),
#         protocol_authentication=data.get("protocol_authentication"),
#         emcryption=data.get("emcryption"),
#         standard_rfc=data.get("standard_rfc"),
#     )
    
#     for protocol in protocols:

#         Protocols.objects.get_or_create(
#             protocol_name=protocol[0],
#             defaults={
#                 "protocol_category": protocol[1],
#                 "osi_layer": protocol[2],
#                 "transport_protocol": protocol[3],
#                 "default_ports": protocol[4],
#                 "secure_ports": protocol[5],
#                 "protocol_type": protocol[6],
#                 "communication_model": protocol[7],
#                 "used_in": protocol[8],
#                 "used_by": protocol[9],
#                 # "purpose": protocol[10],
#                 "default_ports": protocol[11],
#                 "packet_structure": protocol[12],
#                 "protocol_authentication": protocol[13],
#                 "emcryption": protocol[14],
#                 "standard_rfc": protocol[15],
#                 "protocol_desc": protocol[10],
#             }
#         )

#     print("Protocol Inserted successfully")

#     return Response({
#         "message":"Protocol created successfully",
#         "protocol_id":protocol.protocol_id
#     })

# @api_view(["GET"])
# def protocols_by_category(request):
#     category = request.GET.get("category")

#     protocols = Protocols.objects.filter(
#         protocol_category=category
#     )

#     data = []

#     for protocol in protocols:
#         data.append({
#             "protocol_id": protocol.protocol_id,
#             "protocol_name": protocol.protocol_name
#         })

#     return Response(data)


# @api_view(["GET"])
# def protocol_details(request, id):

#     protocol = get_object_or_404( Protocols, protocol_id=id )

#     return Response({
#         "protocol_id": protocol.protocol_id,
#         "protocol_name": protocol.protocol_name,
#         "protocol_category": protocol.protocol_category,
#         "protocol_type": protocol.protocol_type,
#         "protocol_desc": protocol.protocol_desc,

#         "osi_layer": protocol.osi_layer,
#         "transport_protocol": protocol.transport_protocol,
#         "default_ports": protocol.default_ports,
#         "secure_ports": protocol.secure_ports,

#         "communication_model": protocol.communication_model,
#         "used_in": protocol.used_in,
#         "used_by": protocol.used_by,

#         "purpose": protocol.purpose,

#         "data_format": protocol.default_ports,
#         "packet_structure": protocol.packet_structure,
#         "protocol_authentication": protocol.protocol_authentication,
#         "encryption": protocol.emcryption,
#         "standard_rfc": protocol.standard_rfc,
#     })


# @api_view(['GET'])
# def reports(request):
#     reports = Reports.objects.select_related('project').all()
    
#     print(f"Total reports found: {reports.count()}") 

#     data = []
#     for report in reports:
#         data.append({
#             "report_id": report.report_id,
#             "report_status": report.report_status,
#             "project_id": report.project.project_id,
#             "project_name": report.project.project_name,
#             "priority": report.project.priority,
#             "status": report.project.status,
#         })
#     return Response(data)

# def get_choice_data(choices):
#     return [
#         {
#             "id": index + 1,
#             "value": item[0],
#             "name": item[1]
#         }
#         for index, item in enumerate(choices)
#     ]

# @api_view(["GET"])
# def protocol_categories(request):
#     data = get_choice_data(
#         Protocols.CATEGORY_CHOICES
#     )
#     return Response(data)

# @api_view(["GET"])
# def protocol_types(request):
#     data = get_choice_data(
#         Protocols.PROTOCOL_TYPE
#     )
#     return Response(data)

# @api_view(["GET"])
# def osi_layers(request):
#     data = get_choice_data(
#         Protocols.OSI_LAYER_CHOICES
#     )
#     return Response(data)


# @api_view(["GET"])
# def transport_protocols(request):
#     data = []
#     for index, (value, name) in enumerate(
#         Protocols.TRANSPORT_PROTOCOL_CHOICES
#     ):
#         data.append({
#             "id": index,
#             "value": value,
#             "name": name
#         })

#     return Response(data)

# @api_view(["GET"])
# def communication_models(request):
#     data = []
#     for index, (value, name) in enumerate(
#         Protocols.COMMUNICATION_MODEL
#     ):
#         data.append({
#             "id": index,
#             "value": value,
#             "name": name
#         })

#     return Response(data)


# @api_view(["GET"])
# def used_in(request):
#     data = get_choice_data(
#         Protocols.USED_IN
#     )
#     return Response(data)

# @api_view(["GET"])
# def used_by(request):
#     data = get_choice_data(
#         Protocols.USED_BY
#     )
#     return Response(data)

# @api_view(["GET"])
# def data_format(request):
#     data = get_choice_data(
#         Protocols.DATA_FORMAT
#     )
#     return Response(data)

# @api_view(["GET"])
# def protocol_authentication(request):
#     data = get_choice_data(
#         Protocols.PROTOCOL_AUTHENTICATION
#     )
#     return Response(data)

# @api_view(["GET"])
# def encryption(request):
#     data = get_choice_data(
#         Protocols.ENCRYPTION
#     )
#     return Response(data)

# @api_view(["GET"])
# def standard_rfc(request):
#     data = get_choice_data(
#         Protocols.STANDARDS_RFC
#     )
#     return Response(data)

# @api_view(["GET"])
# def tools(request):
#     suite_id = request.GET.get("suite")
#     stage_id = request.GET.get("stage")

#     if not suite_id or not stage_id:
#         return Response([])

#     mappings = ToolMapping.objects.filter(
#         suite_id=suite_id,
#         stage_id=stage_id,
#         tool__tool_status=True
#     ).select_related(
#         "tool"
#     )
#     data=[]

#     for item in mappings:
#         data.append({
#             "id":item.tool.id,
#             "tool_id":item.tool.tool_id,
#             "tool_name":item.tool.tool_name,
#             "tool_category":item.tool.tool_category,
#             "tool_desc":item.tool.tool_desc,
#             "tool_status":item.tool.tool_status
#         })
#     return Response(data)

# @api_view(["POST"])
# def tools_create(request):

#     tool = Tools.objects.create(
#         tool_name=request.data.get("tool_name"),
#         tool_category=request.data.get("tool_category"),
#         tool_desc=request.data.get("tool_desc"),
#         tool_status=request.data.get("tool_status", True)
#     )

#     suite_id = request.data.get("suite")
#     stage_id = request.data.get("stage")

#     if suite_id and stage_id:
#         ToolMapping.objects.create(
#             tool=tool,
#             suite_id=suite_id,
#             stage_id=stage_id
#         )

#     return Response(
#         {
#             "message":"Tool Added Successfully",
#             "tool_id":tool.tool_id
#         },
#         status=201
#     )


# @api_view(['GET'])
# def admin_dashboard(request):
#     return Response({
#         "message": "Welcome to Admin Dashboard"
#     })


# @api_view(['GET'])
# def supportadmin_dashboard(request):
#     return Response({
#         "message": "Welcome to Support Admin Dashboard"
#     })

# @api_view(['GET'])
# def testmanager_dashboard(request):
#     return Response({
#         "message": "Welcome to Test Manager Dashboard"
#     })

# @api_view(["GET"])
# def testmanager_creation(request):
#     managers = User.objects.filter(role="TEST_MANAGER")

#     data = list(
#         managers.values(
#             "id",
#             "first_name",
#             "last_name"
#         )
#     )

#     return Response(data)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def manager_projects(request):
#     if request.user.role != "TEST_MANAGER":
#         return Response(
#             {"error": "Access Denied"},
#             status=403
#         )

#     projects = Project.objects.filter(
#         manager=request.user,
#         status="ASSIGNED_PENDING"
#     ).select_related("customer")

#     data = []

#     for project in projects:
#         data.append({
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "project_type": project.project_type,
#             "customer": project.customer.organization,
#             "priority": project.priority,
#             "status": project.status,
#             "start_date": project.start_date,
#             "deadline": project.deadline,
#             "testing_stage": project.testing_stage,
#         })

#     return Response(data)

# @api_view(["PUT"])
# @permission_classes([IsAuthenticated])
# def assign_tester(request, project_id):
#     try:
#         project = Project.objects.get(
#             project_id=project_id,
#             manager=request.user
#         )

#     except Project.DoesNotExist:
#         return Response(
#             {
#                 "error":"Project not found"
#             },
#             status=404
#         )

#     tester_id = request.data.get("tester")

#     try:
#         tester = User.objects.get(
#             id=tester_id,
#             role="TESTER"
#         )

#     except User.DoesNotExist:
#         return Response(
#             {
#                 "error":"Tester not found"
#             },
#             status=404
#         )

#     ProjectAssignment.objects.create(
#         project=project,
#         tester=tester,
#         assigned_by=request.user
#     )

#     project.status="TESTER_ASSIGNED"
#     project.save()

#     return Response(
#         {
#             "message":"Tester assigned successfully",
#             "project_id":project.project_id,
#             "tester":tester.username,
#             "status":project.status
#         },
#         status=200
#     )


# @api_view(['GET'])
# def tester_dashboard(request):
#     return Response({
#         "message": "Welcome to Tester Dashboard"
#     })

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def tester_projects(request):

#     if request.user.role != "TESTER":
#         return Response(
#             {
#                 "error":"Access Denied"
#             },
#             status=403
#         )

#     assignments = ProjectAssignment.objects.filter(
#         tester=request.user
#     ).select_related(
#         "project",
#         "assigned_by"
#     )

#     data=[]

#     for assignment in assignments:
#         project = assignment.project
#         data.append({
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "project_type": project.project_type,
#             "priority": project.priority,
#             "status": project.status,
#             "deadline": project.deadline,
#             "assigned_by": assignment.assigned_by.username,
#             "testing_stage": project.testing_stage
#         })
#     return Response(data)

# @api_view(["PUT"])
# @permission_classes([IsAuthenticated])
# def update_project_stage(request, project_id):

#     stage = request.data.get("stage")

#     project = Project.objects.get(
#         project_id=project_id
#     )

#     project.current_stage = stage
#     project.save()

#     return Response({
#         "message":"Stage updated",
#         "current_stage":project.current_stage
#     })

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def tester_project_detail(request, project_id):

#     print("PROJECT ID:", project_id)
#     print("USER:", request.user)

#     try:
#         assignment = ProjectAssignment.objects.select_related(
#             "project",
#             "tester",
#             "assigned_by"
#         ).get(
#             project__project_id=project_id,
#             tester=request.user
#         )

#         project = assignment.project

#         print("PROJECT FOUND:", project)

#         data = {
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "customer": str(project.customer),
#             "manager": str(project.manager),
#             "priority": project.priority,
#             "deadline": project.deadline,
#             "status": project.status,
#             "project_type": project.project_type,
#         }

#         return Response(data)


#     except Exception as e:
#         import traceback
#         traceback.print_exc()

#         return Response(
#             {
#                 "error": str(e)
#             },
#             status=500
#         )

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def tester_list(request):
#     if request.user.role != "TEST_MANAGER":
#         return Response(
#             {"error":"Access Denied"},
#             status=403
#         )
#     testers = User.objects.filter(
#         role="TESTER"
#     )

#     data=[]

#     for tester in testers:
#         data.append({
#             "id": tester.id,
#             "first_name": tester.first_name,
#             "last_name": tester.last_name,
#             "username": tester.username,
#             "user_id": tester.user_id
#         })

#     return Response(data)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def my_projects(request):

#     projects = Project.objects.filter(
#         manager=request.user
#     )

#     serializer = ProjectSerializer(
#         projects,
#         many=True
#     )

#     return Response(serializer.data)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def testing(request, project_id):
#     if request.user.role != "TESTER":
#         return Response(
#             {"error": "Access Denied"},
#             status=403
#         )

#     try:
#         assignment = ProjectAssignment.objects.select_related(
#             "project",
#             "assigned_by"
#         ).get(
#             project__project_id=project_id,
#             tester=request.user
#         )
#     except ProjectAssignment.DoesNotExist:
#         return Response(
#             {"error": "Project not assigned"},
#             status=404
#         )

#     project = assignment.project

#     return Response({
#         "project": {
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "project_type": project.project_type,
#             "customer": project.customer.organization,
#             "manager": project.manager.username,
#             "priority": project.priority,
#             "status": project.status,
#             "deadline": project.deadline,
#             "testing_stage": project.testing_stage,
#             "progress": project.progress,
#         }
#     })

# @api_view(['GET'])
# def customer_dashboard(request):
#     return Response({
#         "message": "Welcome to Customer Dashboard"
#     })

# @api_view(["GET"])
# def customer_creation(request):
#     customers = User.objects.filter(role="CUSTOMER")

#     data = list(
#         customers.values(
#             "id",
#             "first_name",
#             "last_name"
#         )
#     )

#     return Response(data)

# @api_view(["POST"])
# def run_amass(request):

#     data = request.data

#     mode = data.get("mode")
#     domain = data.get("domain")
#     organization = data.get("organization")
#     asn = data.get("asn")
#     cidr = data.get("cidr")
#     wordlist = data.get("wordlist")
#     output = data.get("output")

#     ip = data.get("ip")
#     brute = data.get("brute")
#     alterations = data.get("alterations")
#     silent = data.get("silent")

#     cmd = ["amass"]

#     if mode in ["passive", "active"]:
#         cmd.append("enum")
#         if mode == "passive":
#             cmd.append("-passive")
#         if mode == "active":
#             cmd.append("-active")
#         if brute:
#             cmd.append("-brute")
#         if alterations:
#             cmd.append("-alts")
#         if ip:
#             cmd.append("-ip")
#         if silent:
#             cmd.append("-silent")
#         if wordlist:
#             cmd.extend(["-w", wordlist])
#         if output:
#             cmd.extend(["-o", output])
#         cmd.extend(["-d", domain])

#     elif mode == "whois":
#         cmd = [
#             "amass",
#             "intel",
#             "-whois",
#             "-d",
#             domain,
#         ]

#     elif mode == "organization":
#         cmd = [
#             "amass",
#             "intel",
#             "-org",
#             organization,
#         ]

#     elif mode == "asn":
#         cmd = [
#             "amass",
#             "intel",
#             "-asn",
#             str(asn),
#         ]

#     elif mode == "cidr":
#         cmd = [
#             "amass",
#             "intel",
#             "-cidr",
#             cidr,
#         ]

#     try:
#         result = subprocess.run(
#             cmd,
#             capture_output=True,
#             text=True,
#             timeout=600
#         )

#         return Response({
#             "status": "success",
#             "command": " ".join(cmd),
#             "output": result.stdout,
#             "error": result.stderr
#         })

#     except subprocess.TimeoutExpired:
#         return Response({
#             "status": "failed",
#             "output": "",
#             "error": "Scan Timed Out"
#         })

#     except Exception as e:
#         return Response({
#             "status": "failed",
#             "output": "",
#             "error": str(e)
#         })


# @api_view(["GET"])
# def parameter_list(request):
#     tool = request.GET.get("tool")
#     parameters = ToolParameter.objects.filter(
#         tool_id=tool
#     ).order_by(
#         "display_order"
#     )

#     return Response(
#         ToolParameterSerializer(
#             parameters,
#             many=True
#         ).data
#     )



import base64
import datetime
import io
import os
import subprocess
from django.db import IntegrityError
from django.db.models import Q
from django.http import JsonResponse
import qrcode
import pyotp

from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from account.serialization import (
    ProjectSerializer,
    ToolParameterSerializer,
)

# from backend.backend import settings
from django.conf import settings

from .models import (
    Project,
    ProjectAssignment, 
    Protocols, 
    Reports, 
    Stages,
    SuiteStageMapping, 
    Suites, 
    ToolMapping, 
    ToolParameter, 
    Tools, 
    User
)

from rest_framework import status
from django.shortcuts import get_object_or_404


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Email not found"
            },
            status=404
        )

    user = authenticate(
        request,
        username=user_obj.username,
        password=password
    )

    if user is None:
        return Response(
            {
                "success": False,
                "message": "Invalid credentials"
            },
            status=401
        )

    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save(
            update_fields=["totp_secret"]
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "success": True,
            "user_id": user.id,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }
    )


def generate_qr_code(user):
    if not user.totp_secret:
        user.generate_totp_secret()
        user.save()

    totp = pyotp.TOTP(user.totp_secret)

    uri = totp.provisioning_uri(
        name=user.email,
        issuer_name="CyberToolKit"
    )

    qr = qrcode.make(uri)

    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")

    return base64.b64encode(buffer.getvalue()).decode()


@api_view(["POST"])
@permission_classes([AllowAny])
def setup_mfa(request):
    """Public endpoint - No authentication required"""
    user_id = request.data.get("user_id")

    if not user_id:
        return Response({
            "success": False,
            "message": "user_id required"
        }, status=400)

    try:
        user = User.objects.get(id=user_id)
        qr = generate_qr_code(user)

        return Response({
            "success": True,
            "qr_code": qr
        })

    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=404)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_totp(request):
    """Public endpoint - No authentication required"""
    user_id = request.data.get("user_id")
    code = request.data.get("totp")
    
    if not user_id or not code:
        return Response({
            "success": False,
            "message": "user_id and totp are required"
        }, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        
        if not user.totp_secret:
            return Response({
                "success": False,
                "message": "TOTP not set up for this user"
            }, status=400)
        
        totp = pyotp.TOTP(user.totp_secret)
        
        if not code:
            return Response({
                "success": False,
                "message": "Please enter OTP"
            }, status=400)
        
        if not totp.verify(code, valid_window=1):
            return Response({
                "success": False,
                "message": "Invalid OTP"
            }, status=400)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "success": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "username": user.username,
        })
        
    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=404)
    
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):

    user = request.user

    return Response({
        "user_id": user.user_id,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "contact": user.contact,
        "organization": user.organization,
        "location": user.location,
        "department": user.department,
        "account_status": user.account_status
    })


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):

    user = request.user
    data = request.data

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.contact = data.get("contact", user.contact)
    user.organization = data.get("organization", user.organization)
    user.location = data.get("location", user.location)
    user.department = data.get("department", user.department)

    user.save()

    return Response({
        "message": "Profile updated successfully"
    })


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not user.check_password(current_password):
        return Response({
            "error":"Current password is incorrect."
        }, status=400)

    if new_password != confirm_password:
        return Response({
            "error":"New passwords do not match."
        }, status=400)

    user.set_password(new_password)
    user.save()

    return Response({
        "message":"Password Changed Successfully"
    })

# @api_view(['POST'])
# create_log(
#     event_id = 1001,
#     event_name = "Login Successfull",
#     level = "INFO",
#     unique_info = User.email,
#     user = User.username
# )


@api_view(['GET'])
@permission_classes([AllowAny])
def master_dashboard(request):
    return Response({
        "message": "Welcome to Master Dashboard"
    })

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_creation(request):

    data = request.data
    role = data.get("role")

    try:
        if role == "CUSTOMER":
            user = User.objects.create_user(
                username=data.get("email"),
                email=data.get("email"),
                password="default123",
                role="CUSTOMER",
                organization=data.get("organization"),
                location=data.get("location"),
                # email=data.get("email"),
                contact_person=data.get("contact_person"),
                contact_person_email=data.get("contact_person_email"),
                designation=data.get("designation"),
                account_status=data.get("account_status", "ACTIVE"),
            )
        else:
            user = User.objects.create_user(
                username=data.get("email"),
                email=data.get("email"),
                password="default123",
                role=role,
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                contact=data.get("contact"),
                organization=data.get("organization"),
                location=data.get("location"),
                department=data.get("department"),
                account_status=data.get("account_status", "ACTIVE"),
            )
        return Response(
            {
                "message": "User created successfully",
                "user_id": user.user_id,
            },
            status=status.HTTP_201_CREATED,
        )

    except IntegrityError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def customer_view(request):
    customers = User.objects.filter(role="CUSTOMER")

    data = []

    for user in customers:
        data.append({
            "user_id": user.user_id,
            "id": user.id,
            "organization": user.organization,
            "email": user.email,
            "location": user.location,
            "contact_person": user.contact_person,
            "contact_person_email": user.contact_person_email,
            "account_status": user.account_status
        })

    return Response(data)
 
@api_view(["GET"])
@permission_classes([AllowAny])
def user_view(request):
    users = User.objects.all()

    data = []

    for user in users:
        data.append({
            "user_id": user.user_id,
            "role": user.role,

            "first_name": user.first_name,
            "last_name": user.last_name,

            "email": user.email,
            "contact_person": user.contact_person,
            "contact_person_email": user.contact_person_email,
            "designation": user.designation,

            "email": user.email,
            "contact": user.contact,
            "organization": user.organization,
            "location": user.location,
            "department": user.department,
            "account_status": user.account_status,
        })

    return Response(data)

@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        user.delete()

        return Response({
            "message": "User deleted !!"
        })
    
    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        }, status=404)


@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        data = request.data

        if user.role == "CUSTOMER":
            user.organization = data.get("organization", user.organization)
            user.email = data.get("email", user.email)
            user.location = data.get("location", user.location)
            user.contact_person = data.get("contact_person", user.contact_person)
            user.contact_person_email = data.get(
                "contact_person_email",
                user.contact_person_email
            )
            user.designation = data.get("designation", user.designation)

            if "email" in data:
                user.username = user.email
                user.email = user.email

        else:
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.contact = data.get("contact", user.contact)
            user.email = data.get("email", user.email)
            user.organization = data.get("organization", user.organization)
            user.location = data.get("location", user.location)
            user.department = data.get("department", user.department)

            if "email" in data:
                user.username = user.email

        user.save()

        return Response({
            "message": "User Updated Successfully!!"
        })

    except User.DoesNotExist:
        return Response({
            "error": "User not found"
        }, status=404)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def project_creation(request):
    try:
        data = request.data

        project = Project.objects.create(
            project_name=data.get("project_name"),
            project_type=data.get("project_type"),
            customer_id=data.get("customer"),
            manager_id=data.get("manager"),
            project_desc=data.get("project_desc"),
            priority=data.get("priority"),
            status="ASSIGNED_PENDING",
            start_date=data.get("start_date"),
            deadline=data.get("deadline"),
            progress=data.get("progress", 0),
        )

        Reports.objects.create(
            project=project,
            report_status="PENDING"
        )

        return Response({
            "message":"Project and Report created successfully",
            "project_id":project.project_id
        },status=201)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=400)

# In your views.py
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from .models import Suites

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_suites(request):
    try:
        suites = Suites.objects.all().values(
            'suite_id', 
            'suite_name', 
            'suite_code', 
            'std_follows',
            'suite_desc'
        )
        
        suite_list = []
        for suite in suites:
            suite_list.append({
                'id': suite['suite_code'],
                'name': suite['suite_name'],
                'code': suite['suite_code'],
                'description': suite['suite_desc'],
                'standard': suite['std_follows']
            })
        
        return Response(suite_list, status=200)
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch suites: {str(e)}'},
            status=500
        )

@api_view(["GET"])
@permission_classes([AllowAny])
def project_view(request):
    projects = Project.objects.select_related(
        "customer",
        "manager"
    )

    data = []

    for project in projects:
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "priority": project.priority,
            "status": project.status,
            "start_date":project.start_date,
            "deadline": project.deadline,

            "customer": f"{project.customer.organization}",
            "manager": f"{project.manager.first_name} {project.manager.last_name}",
            "assigned_by": f"{project.manager.first_name} {project.manager.last_name}",
        })

    def save(self, *args, **kwargs):
        if not self.project_id:
            last_project = Project.objects.order_by("-id").first()

            if last_project:
                last_number = int(last_project.project_id.replace("PR", ""))
                new_number = last_number + 1
            else:
                new_number = 1

            self.project_id = f"PR{new_number:03d}"

        super().save(*args, **kwargs)

    return Response(data)

PROJECT_TYPE_TO_SUITE_CODE = {
    "WEBAPP": "WEB",
    "MOBILE": "MOBILE",
    "NETWORK": "NETWORK",
    "IOT": "IOT",
    "EMBEDDED": "EMBEDDED",
    "RADIO": "RADIO",
    "THICK": "THICK_CLIENT",
    "SOURCE": "SOURCE_CODE",
}

@api_view(['GET'])
@permission_classes([AllowAny])
def suites(request):
    suites = Suites.objects.all()

    name = request.GET.get("name")

    if name:
        suite_code = PROJECT_TYPE_TO_SUITE_CODE.get(name, name)
        suites = suites.filter(
            Q(suite_code__iexact=suite_code) | Q(suite_name__iexact=suite_code)
        )

    data = []

    for suite in suites:
        data.append({
            "id":suite.id,
            "suite_id": suite.suite_id,
            "suite_name": suite.suite_name,
            "suite_code": suite.suite_code,
            "std_follows": suite.std_follows,
            "suite_desc": suite.suite_desc,
        })

    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def suite_create(request):
    data = request.data

    suite = Suites.objects.create(
        suite_id=data.get("suite_id"),
        suite_name=data.get("suite_name"),
        suite_code=data.get("suite_code"),
        std_follows=data.get("std_follows"),
        suite_desc=data.get("suite_desc"),
    )

    return Response({
        "message": "Suite created successfully",
        "id": suite.id,
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def stages(request):

    suite_id = request.GET.get("suite")

    if not suite_id:
        return Response([])

    mappings = SuiteStageMapping.objects.filter(
        suite_id=suite_id
    ).select_related("stage")

    data = []

    for mapping in mappings:
        data.append({
            "id": mapping.stage.id,
            "stage_id": mapping.stage.stage_id,
            "stage_name": mapping.stage.stage_name,
            "stage_order": mapping.stage.stage_order,
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def protocols(request):
    protocols = Protocols.objects.all()

    data = []

    for protocol in protocols:
        data.append({
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.protocol_name,
            "protocol_category": protocol.protocol_category,
            "protocol_type": protocol.protocol_type,
            "protocol_desc": protocol.protocol_desc,
            
            "osi_layer": protocol.osi_layer,
            "transport_protocol": protocol.transport_protocol,
            "default_ports": protocol.default_ports,
            "secure_ports": protocol.secure_ports,
            "communication_model": protocol.communication_model,
            
            "used_in": protocol.used_in,
            "used_by": protocol.used_by,
            "purpose": protocol.purpose,
            "data_format": protocol.data_format,
            "packet_structure": protocol.packet_structure,
            "protocol_authentication": protocol.protocol_authentication,
            "encryption": protocol.emcryption,
            "standard_rfc": protocol.standard_rfc,
        })
    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def protocol_creation(request):

    data = request.data

    protocol = Protocols.objects.create(
        protocol_name=data.get("protocol_name"),
        protocol_category=data.get("protocol_category"),
        protocol_type=data.get("protocol_type"),
        protocol_desc=data.get("protocol_desc"),

        osi_layer=data.get("osi_layer"),
        transport_protocol=data.get("transport_protocol"),

        default_ports=data.get("default_ports"),
        secure_ports=data.get("secure_ports"),

        communication_model=data.get("communication_model"),
        used_in=data.get("used_in"),
        used_by=data.get("used_by"),

        purpose=data.get("purpose"),
        data_format=data.get("data_format"),
        packet_structure=data.get("packet_structure"),
        protocol_authentication=data.get("protocol_authentication"),
        emcryption=data.get("emcryption"),
        standard_rfc=data.get("standard_rfc"),
    )
    
    for protocol in protocols:

        Protocols.objects.get_or_create(
            protocol_name=protocol[0],
            defaults={
                "protocol_category": protocol[1],
                "osi_layer": protocol[2],
                "transport_protocol": protocol[3],
                "default_ports": protocol[4],
                "secure_ports": protocol[5],
                "protocol_type": protocol[6],
                "communication_model": protocol[7],
                "used_in": protocol[8],
                "used_by": protocol[9],
                # "purpose": protocol[10],
                "default_ports": protocol[11],
                "packet_structure": protocol[12],
                "protocol_authentication": protocol[13],
                "emcryption": protocol[14],
                "standard_rfc": protocol[15],
                "protocol_desc": protocol[10],
            }
        )

    print("Protocol Inserted successfully")

    return Response({
        "message":"Protocol created successfully",
        "protocol_id":protocol.protocol_id
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def protocols_by_category(request):
    category = request.GET.get("category")

    protocols = Protocols.objects.filter(
        protocol_category=category
    )

    data = []

    for protocol in protocols:
        data.append({
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.protocol_name
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_details(request, id):

    protocol = get_object_or_404( Protocols, protocol_id=id )

    return Response({
        "protocol_id": protocol.protocol_id,
        "protocol_name": protocol.protocol_name,
        "protocol_category": protocol.protocol_category,
        "protocol_type": protocol.protocol_type,
        "protocol_desc": protocol.protocol_desc,

        "osi_layer": protocol.osi_layer,
        "transport_protocol": protocol.transport_protocol,
        "default_ports": protocol.default_ports,
        "secure_ports": protocol.secure_ports,

        "communication_model": protocol.communication_model,
        "used_in": protocol.used_in,
        "used_by": protocol.used_by,

        "purpose": protocol.purpose,

        "data_format": protocol.default_ports,
        "packet_structure": protocol.packet_structure,
        "protocol_authentication": protocol.protocol_authentication,
        "encryption": protocol.emcryption,
        "standard_rfc": protocol.standard_rfc,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def reports(request):
    reports = Reports.objects.select_related('project').all()
    
    print(f"Total reports found: {reports.count()}") 

    data = []
    for report in reports:
        data.append({
            "report_id": report.report_id,
            "report_status": report.report_status,
            "project_id": report.project.project_id,
            "project_name": report.project.project_name,
            "priority": report.project.priority,
            "status": report.project.status,
        })
    return Response(data)

def get_choice_data(choices):
    return [
        {
            "id": index + 1,
            "value": item[0],
            "name": item[1]
        }
        for index, item in enumerate(choices)
    ]

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_categories(request):
    data = get_choice_data(
        Protocols.CATEGORY_CHOICES
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_types(request):
    data = get_choice_data(
        Protocols.PROTOCOL_TYPE
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def osi_layers(request):
    data = get_choice_data(
        Protocols.OSI_LAYER_CHOICES
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def transport_protocols(request):
    data = []
    for index, (value, name) in enumerate(
        Protocols.TRANSPORT_PROTOCOL_CHOICES
    ):
        data.append({
            "id": index,
            "value": value,
            "name": name
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def communication_models(request):
    data = []
    for index, (value, name) in enumerate(
        Protocols.COMMUNICATION_MODEL
    ):
        data.append({
            "id": index,
            "value": value,
            "name": name
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def used_in(request):
    data = get_choice_data(
        Protocols.USED_IN
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def used_by(request):
    data = get_choice_data(
        Protocols.USED_BY
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def data_format(request):
    data = get_choice_data(
        Protocols.DATA_FORMAT
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def protocol_authentication(request):
    data = get_choice_data(
        Protocols.PROTOCOL_AUTHENTICATION
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def encryption(request):
    data = get_choice_data(
        Protocols.ENCRYPTION
    )
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def standard_rfc(request):
    data = get_choice_data(
        Protocols.STANDARDS_RFC
    )
    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tools(request):
    suite_id = request.GET.get("suite")
    stage_id = request.GET.get("stage")

    # If no suite/stage provided, return ALL tools
    if not suite_id or not stage_id:
        all_tools = Tools.objects.all()
        data = []
        for tool in all_tools:
            # Get mapping for this tool if exists
            mapping = ToolMapping.objects.filter(tool=tool).first()
            data.append({
                "id": tool.id,
                "tool_id": tool.tool_id,
                "tool_name": tool.tool_name,
                "tool_category": tool.tool_category,
                "tool_desc": tool.tool_desc,
                "tool_status": tool.tool_status,
                "suite": mapping.suite.suite_name if mapping and mapping.suite else "N/A",
                "stage": mapping.stage.stage_name if mapping and mapping.stage else "N/A",
            })
        return Response(data)

    # Original logic for filtered tools
    mappings = ToolMapping.objects.filter(
        suite_id=suite_id,
        stage_id=stage_id,
        tool__tool_status=True
    ).select_related("tool", "suite", "stage")
    
    data = []
    for item in mappings:
        data.append({
            "id": item.tool.id,
            "tool_id": item.tool.tool_id,
            "tool_name": item.tool.tool_name,
            "tool_category": item.tool.tool_category,
            "tool_desc": item.tool.tool_desc,
            "tool_status": item.tool.tool_status,
            "suite": item.suite.suite_name if item.suite else suite_id,
            "stage": item.stage.stage_name if item.stage else stage_id,
        })
    return Response(data)

@api_view(["POST"])
@permission_classes([AllowAny])
def tools_create(request):

    tool = Tools.objects.create(
        tool_name=request.data.get("tool_name"),
        tool_category=request.data.get("tool_category"),
        tool_desc=request.data.get("tool_desc"),
        tool_status=request.data.get("tool_status", True)
    )

    suite_id = request.data.get("suite")
    stage_id = request.data.get("stage")

    if suite_id and stage_id:
        ToolMapping.objects.create(
            tool=tool,
            suite_id=suite_id,
            stage_id=stage_id
        )

    return Response(
        {
            "message":"Tool Added Successfully",
            "tool_id":tool.tool_id
        },
        status=201
    )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def save_output(request):
    """Save command output to a file"""
    try:
        filename = request.data.get("filename")
        content = request.data.get("content")
        
        if not filename or not content:
            return Response(
                {"error": "Filename and content are required"},
                status=400
            )
        
        # Ensure .txt extension
        if not filename.endswith('.txt'):
            filename = filename + '.txt'
        
        # Create directory if it doesn't exist
        output_dir = os.path.join(settings.BASE_DIR, "outputs")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Add timestamp to filename to avoid overwriting
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        final_filename = f"{name}_{timestamp}{ext}"
        filepath = os.path.join(output_dir, final_filename)
        
        # Write content to file
        with open(filepath, 'w') as f:
            f.write(content)
        
        return Response({
            "message": "File saved successfully",
            "filepath": filepath,
            "filename": final_filename
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=500
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard(request):
    return Response({
        "message": "Welcome to Admin Dashboard"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def supportadmin_dashboard(request):
    return Response({
        "message": "Welcome to Support Admin Dashboard"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def testmanager_dashboard(request):
    return Response({
        "message": "Welcome to Test Manager Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testmanager_creation(request):
    managers = User.objects.filter(role="TEST_MANAGER")

    data = list(
        managers.values(
            "id",
            "first_name",
            "last_name"
        )
    )

    return Response(data)

# @api_view(["GET"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def manager_projects(request):
#     if request.user.role != "TEST_MANAGER":
#         return Response(
#             {"error": "Access Denied"},
#             status=403
#         )

#     projects = Project.objects.filter(
#         manager=request.user,
#         status="ASSIGNED_PENDING"
#     ).select_related("customer")

#     data = []

#     for project in projects:
#         data.append({
#             "project_id": project.project_id,
#             "project_name": project.project_name,
#             "project_type": project.project_type,
#             "customer": project.customer.organization,
#             "priority": project.priority,
#             "status": project.status,
#             "start_date": project.start_date,
#             "deadline": project.deadline,
#             "testing_stage": project.testing_stage,
#             "manager":project.manager
#         })

#     return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manager_projects(request):
    if request.user.role != "TEST_MANAGER":
        return Response(
            {"error": "Access Denied"},
            status=403
        )

    projects = Project.objects.filter(
        manager=request.user
    ).exclude(
        status="COMPLETED"
    ).select_related("customer")

    # OR get specific statuses
    # projects = Project.objects.filter(
    #     manager=request.user,
    #     status__in=["ASSIGNED_PENDING", "TESTER_ASSIGNED", "TESTING", "REPORT_PENDING", "APPROVED"]
    # ).select_related("customer")

    data = []
    for project in projects:
        customer_data = None
        if project.customer:
            customer_data = {
                "id": project.customer.id,
                "organization": project.customer.organization,
                "username": project.customer.username,
                "email": project.customer.email
            }
        
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "project_desc": project.project_desc,
            "customer": project.customer.organization if project.customer and project.customer.organization else (project.customer.username if project.customer else None),
            "customer_data": customer_data,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "testing_stage": project.testing_stage,
            "progress": project.progress,
            "current_stage": project.current_stage,
        })

    return Response(data)


@api_view(['POST', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def assign_tester(request, project_id):
    try:
        project = Project.objects.get(project_id=project_id, manager=request.user)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    tester_id = request.data.get("tester_id") or request.data.get("tester")
    if not tester_id:
        return Response({"error": "tester_id or tester is required"}, status=400)

    try:
        tester = User.objects.get(id=tester_id, role="TESTER")
    except User.DoesNotExist:
        return Response({"error": "Tester not found"}, status=404)

    if ProjectAssignment.objects.filter(project=project, tester=tester).exists():
        return Response({"error": "Tester already assigned to this project"}, status=400)

    ProjectAssignment.objects.create(
        project=project,
        tester=tester,
        assigned_by=request.user
    )
    project.status = "TESTER_ASSIGNED"
    project.save()

    return Response({
        "message": "Tester assigned successfully",
        "project_id": project.project_id,
        "tester": tester.username,
        "status": project.status
    }, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def tester_dashboard(request):
    return Response({
        "message": "Welcome to Tester Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_projects(request):

    if request.user.role != "TESTER":
        return Response(
            {
                "error":"Access Denied"
            },
            status=403
        )

    assignments = ProjectAssignment.objects.filter(
        tester=request.user
    ).select_related(
        "project",
        "assigned_by"
    )

    data=[]

    for assignment in assignments:
        project = assignment.project
        data.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "assigned_by": assignment.assigned_by.username,
            # "testing_stage": project.testing_stage
            "current_stage": project.current_stage
        })
    return Response(data)

@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_project_stage(request, project_id):
    stage = request.data.get("stage")
    project = Project.objects.get(
        project_id=project_id
    )

    valid_codes = [code for code, _ in Project.STAGE_CHOICES]

    if stage not in valid_codes:
        try:
            stage_obj = Stages.objects.get(stage_id=stage)
            stage = Project.STAGE_CHOICES[stage_obj.stage_order - 1][0]
        except (Stages.DoesNotExist, IndexError):
            pass

    project.current_stage = stage
    project.save()

    return Response({
        "message":"Stage updated",
        "current_stage":project.current_stage
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testmanager_report(request):
    """
    Get all reports for projects managed by the logged-in test manager.
    """
    try:
        user = request.user
        
        # Check if user is a test manager
        if user.role not in ["TEST_MANAGER", "testmanager", "MANAGER", "manager"]:
            return Response(
                {"error": "Access Denied. Test Manager privileges required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        projects = Project.objects.filter(manager=user)
        project_ids = projects.values_list('project_id', flat=True)
        
        reports = Reports.objects.filter(
            project_id__in=project_ids
        ).select_related('project')
        
        reports_data = []
        for report in reports:
            reports_data.append({
                'report_id': report.report_id,
                'project_id': report.project.project_id,
                'project_name': report.project.project_name,
                'project_type': report.project.project_type,
                'priority': report.project.priority,
                'report_status': report.report_status,
                'generated_date': str(report.generated_date) if hasattr(report, 'generated_date') else None,
                'approved_date': str(report.approved_date) if hasattr(report, 'approved_date') else None,
                'rejection_reason': getattr(report, 'rejection_reason', None),
                'assigned_to': None,  # Will be filled below
            })
            
            assignment = ProjectAssignment.objects.filter(project=report.project).first()
            if assignment and assignment.tester:
                reports_data[-1]['assigned_to'] = assignment.tester.username
        
        return Response(reports_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in testmanager_reports: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_project_detail(request, project_id):

    # print("Project ID:", project_id)
    # print("User:", request.user)

    try:
        assignment = ProjectAssignment.objects.select_related(
            "project",
            "tester",
            "assigned_by"
        ).get(
            project__project_id=project_id,
            tester=request.user
        )

        project = assignment.project

        # print("Project found:", project)

        data = {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "customer": str(project.customer),
            "manager": str(project.manager),
            "priority": project.priority,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "status": project.status,
            "project_type": project.project_type,
            "current_stage": project.current_stage
        }
        return Response(data)

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response(
            {
                "error": str(e)
            },
            status=500
        )

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def tester_list(request):
    if request.user.role != "TEST_MANAGER":
        return Response(
            {"error":"Access Denied"},
            status=403
        )
    testers = User.objects.filter(
        role="TESTER"
    )

    data=[]

    for tester in testers:
        data.append({
            "id": tester.id,
            "first_name": tester.first_name,
            "last_name": tester.last_name,
            "username": tester.username,
            "user_id": tester.user_id
        })

    return Response(data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_projects(request):

    projects = Project.objects.filter(
        manager=request.user
    )

    serializer = ProjectSerializer(
        projects,
        many=True
    )

    return Response(serializer.data)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testing(request, project_id):
    if request.user.role != "TESTER":
        return Response(
            {"error": "Access Denied"},
            status=403
        )

    try:
        assignment = ProjectAssignment.objects.select_related(
            "project",
            "assigned_by"
        ).get(
            project__project_id=project_id,
            tester=request.user
        )
    except ProjectAssignment.DoesNotExist:
        return Response(
            {"error": "Project not assigned"},
            status=404
        )

    project = assignment.project

    return Response({
        "project": {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_type": project.project_type,
            "customer": project.customer.organization,
            "manager": project.manager.username,
            "priority": project.priority,
            "status": project.status,
            "start_date": project.start_date,
            "deadline": project.deadline,
            "testing_stage": project.testing_stage,
            "progress": project.progress,
            "current_stage": project.current_stage
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def customer_dashboard(request):
    return Response({
        "message": "Welcome to Customer Dashboard"
    })

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def customer_creation(request):
    customers = User.objects.filter(role="CUSTOMER")

    data = list(
        customers.values(
            "id",
            "first_name",
            "last_name"
        )
    )

    return Response(data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def run_amass(request):

    data = request.data

    mode = data.get("mode")
    domain = data.get("domain")
    organization = data.get("organization")
    asn = data.get("asn")
    cidr = data.get("cidr")
    wordlist = data.get("wordlist")
    output = data.get("output")

    ip = data.get("ip")
    brute = data.get("brute")
    alterations = data.get("alterations")
    silent = data.get("silent")

    cmd = ["amass"]

    if mode in ["passive", "active"]:
        cmd.append("enum")
        if mode == "passive":
            cmd.append("-passive")
        if mode == "active":
            cmd.append("-active")
        if brute:
            cmd.append("-brute")
        if alterations:
            cmd.append("-alts")
        if ip:
            cmd.append("-ip")
        if silent:
            cmd.append("-silent")
        if wordlist:
            cmd.extend(["-w", wordlist])
        if output:
            cmd.extend(["-o", output])
        cmd.extend(["-d", domain])

    elif mode == "whois":
        cmd = [
            "amass",
            "intel",
            "-whois",
            "-d",
            domain,
        ]

    elif mode == "organization":
        cmd = [
            "amass",
            "intel",
            "-org",
            organization,
        ]

    elif mode == "asn":
        cmd = [
            "amass",
            "intel",
            "-asn",
            str(asn),
        ]

    elif mode == "cidr":
        cmd = [
            "amass",
            "intel",
            "-cidr",
            cidr,
        ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600
        )

        return Response({
            "status": "success",
            "command": " ".join(cmd),
            "output": result.stdout,
            "error": result.stderr
        })

    except subprocess.TimeoutExpired:
        return Response({
            "status": "failed",
            "output": "",
            "error": "Scan Timed Out"
        })

    except Exception as e:
        return Response({
            "status": "failed",
            "output": "",
            "error": str(e)
        })


@api_view(["GET"])
@permission_classes([AllowAny])
def parameter_list(request):
    tool = request.GET.get("tool")
    parameters = ToolParameter.objects.filter(
        tool_id=tool
    ).order_by(
        "display_order"
    )

    return Response(
        ToolParameterSerializer(
            parameters,
            many=True
        ).data
    )

# @api_view(["POST"])
# @permission_classes([AllowAny])
# def run_command(request):
#     try:
#         command = request.data.get("command")
        
#         if not command:
#             return Response({"output": "Error: No command provided."})

#         full_command = command

#         result = subprocess.run(
#             full_command,
#             shell=True,
#             capture_output=True,
#             text=True,
#             timeout=60
#         )

#         # Combine stdout (the table of ports) and stderr (progress bars)
#         output = result.stdout + result.stderr

#         return Response({"output": output})

#     except subprocess.TimeoutExpired:
#         return Response({"output": "Error: Command timed out after 60 seconds."})
#     except Exception as e:
#         return Response({"output": f"Backend Error: {str(e)}"})

import subprocess
import platform
import os

@api_view(["POST"])
@permission_classes([AllowAny])
def run_command(request):
    try:
        command = request.data.get("command")
        
        if not command:
            return Response({"output": "Error: No command provided."})

        current_os = platform.system()
        full_command = command

        if current_os == "Windows":
            if command.strip().startswith("nmap"):
                pass

            if command.strip().startswith("sudo"):
                full_command = command.replace("sudo", "").strip()

        elif current_os == "Linux":
            if command.strip().startswith("nmap"):
                full_command = f"sudo -n {command}"

        result = subprocess.run(
            full_command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60
        )

        output = result.stdout + result.stderr

        return Response({"output": output})

    except subprocess.TimeoutExpired:
        return Response({"output": "Error: Command timed out after 60 seconds."})
    except Exception as e:
        return Response({"output": f"Backend Error: {str(e)}"})


from account.ai_advisor.engine import analyze as ai_analyze_output


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_analyze(request):
    try:
        output = request.data.get("output", "")
        tool_name = request.data.get("tool_name", "")
        stage_code = request.data.get("stage")  # INFO / SCAN / VULN / EXPLOIT / POST

        if not output or not output.strip():
            return Response({
                "success": False,
                "error": "No output provided to analyze."
            }, status=status.HTTP_400_BAD_REQUEST)

        result = ai_analyze_output(
            tool_name=tool_name,
            raw_text=output,
            stage_code=stage_code,
        )

        return Response({
            "success": True,
            "analysis": result["narrative"],
            "summary_points": result["summary_points"],
            "data": result["data"],
            "stage_id": result["stage_id"],
            "stage_code": result["stage_code"],
            "stage_name": result["stage_name"],
            "stage_complete": result["stage_complete"],
            "completeness_reason": result["completeness_reason"],
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(["POST"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def testmanager_generate_report(request, project_id):
#     """
#     Generate a report for a specific project.
#     """
#     try:
#         user = request.user
        
#         # Check if user is a test manager
#         if user.role not in ["TEST_MANAGER", "testmanager", "MANAGER", "manager"]:
#             return Response(
#                 {"error": "Access Denied. Test Manager privileges required."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Get the project
#         project = get_object_or_404(Project, project_id=project_id)
        
#         # Verify the user manages this project
#         if project.manager != user:
#             return Response(
#                 {"error": "You do not have permission to generate reports for this project."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Check if report already exists
#         report, created = Reports.objects.get_or_create(
#             project=project,
#             defaults={
#                 'report_status': 'GENERATED',
#                 'generated_date': datetime.datetime.now()
#             }
#         )
        
#         if not created:
#             # Update existing report
#             report.report_status = 'GENERATED'
#             report.generated_date = datetime.datetime.now()
#             report.approved_date = None
#             report.approved_by = None
#             report.rejection_reason = None
#             report.save()
        
#         response_data = {
#             'message': 'Report generated successfully',
#             'report_id': report.report_id,
#             'status': report.report_status,
#             'generated_date': str(report.generated_date)
#         }
        
#         return Response(response_data, status=status.HTTP_201_CREATED)
        
#     except Project.DoesNotExist:
#         return Response(
#             {'error': 'Project not found'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         print(f"Error in testmanager_generate_report: {str(e)}")
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(["POST"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def testmanager_approve_report(request, project_id):
#     """
#     Approve a report for a project.
#     """
#     try:
#         user = request.user
        
#         # Check if user is a test manager
#         if user.role not in ["TEST_MANAGER", "testmanager", "MANAGER", "manager"]:
#             return Response(
#                 {"error": "Access Denied. Test Manager privileges required."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Get the project
#         project = get_object_or_404(Project, project_id=project_id)
        
#         # Verify the user manages this project
#         if project.manager != user:
#             return Response(
#                 {"error": "You do not have permission to approve reports for this project."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Get the report
#         report = get_object_or_404(Reports, project=project)
        
#         # Update report status
#         report.report_status = 'APPROVED'
#         report.approved_by = user
#         report.approved_date = datetime.datetime.now()
#         report.save()
        
#         return Response({
#             'message': 'Report approved successfully',
#             'report_id': report.report_id,
#             'status': 'APPROVED',
#             'approved_date': str(report.approved_date)
#         }, status=status.HTTP_200_OK)
        
#     except Project.DoesNotExist:
#         return Response(
#             {'error': 'Project not found'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Reports.DoesNotExist:
#         return Response(
#             {'error': 'Report not found for this project'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         print(f"Error in testmanager_approve_report: {str(e)}")
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(["POST"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def testmanager_reject_report(request, project_id):
#     """
#     Reject a report for a project with a reason.
#     """
#     try:
#         user = request.user
        
#         # Check if user is a test manager
#         if user.role not in ["TEST_MANAGER", "testmanager", "MANAGER", "manager"]:
#             return Response(
#                 {"error": "Access Denied. Test Manager privileges required."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Get the project
#         project = get_object_or_404(Project, project_id=project_id)
        
#         # Verify the user manages this project
#         if project.manager != user:
#             return Response(
#                 {"error": "You do not have permission to reject reports for this project."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Get the report
#         report = get_object_or_404(Reports, project=project)
        
#         # Get rejection reason from request
#         data = json.loads(request.body)
#         reason = data.get('reason', 'No reason provided')
        
#         # Update report status
#         report.report_status = 'REJECTED'
#         report.rejected_by = user
#         report.rejected_date = datetime.datetime.now()
#         report.rejection_reason = reason
#         report.save()
        
#         return Response({
#             'message': 'Report rejected successfully',
#             'report_id': report.report_id,
#             'status': 'REJECTED',
#             'reason': reason,
#             'rejected_date': str(report.rejected_date)
#         }, status=status.HTTP_200_OK)
        
#     except Project.DoesNotExist:
#         return Response(
#             {'error': 'Project not found'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Reports.DoesNotExist:
#         return Response(
#             {'error': 'Report not found for this project'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except json.JSONDecodeError:
#         return Response(
#             {'error': 'Invalid JSON payload'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
#     except Exception as e:
#         print(f"Error in testmanager_reject_report: {str(e)}")
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(["GET"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def testmanager_report_detail(request, project_id):
    """
    Get detailed report for a specific project.
    """
    try:
        user = request.user
        
        # Check if user is a test manager
        if user.role not in ["TEST_MANAGER", "testmanager", "MANAGER", "manager"]:
            return Response(
                {"error": "Access Denied. Test Manager privileges required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the project
        project = get_object_or_404(Project, project_id=project_id)
        
        # Verify the user manages this project
        if project.manager != user:
            return Response(
                {"error": "You do not have permission to view reports for this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the report
        report = get_object_or_404(Reports, project=project)
        
        response_data = {
            'project_id': project.project_id,
            'project_name': project.project_name,
            'project_type': project.project_type,
            'priority': project.priority,
            'report_id': report.report_id,
            'report_status': report.report_status,
            'generated_date': str(report.generated_date) if report.generated_date else None,
            'approved_date': str(report.approved_date) if hasattr(report, 'approved_date') and report.approved_date else None,
            'rejected_date': str(report.rejected_date) if hasattr(report, 'rejected_date') and report.rejected_date else None,
            'rejection_reason': getattr(report, 'rejection_reason', None),
            'report_data': getattr(report, 'report_data', {}),
            'approved_by': report.approved_by.username if hasattr(report, 'approved_by') and report.approved_by else None,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Reports.DoesNotExist:
        return Response(
            {'error': 'Report not found for this project'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in testmanager_report_detail: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )