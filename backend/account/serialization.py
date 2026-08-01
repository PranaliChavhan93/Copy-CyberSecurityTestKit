from rest_framework import serializers
from .models import Project, Protocols, Reports, Stages, Suites, ToolParameter, Tools, User

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "contact",
            "role",
            "department",
            "organization",
            "location",
            "account_status",
            "mfa_enabled",
            "password",
        ]

    def create(self, validated_data):

        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save()
        return user

    def update(self, instance, validated_data):

        password = validated_data.pop("password", None)

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    

class ProtocolSerializer(serializers.ModelSerializer):

    class Meta:
        model = Protocols
        fields = [
            "protocol_id",
            "protocol_name",
            "protocol_category",
            "protocol_type",
            "protocol_desc",
        ]

class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            "project_id",
            "project_name",
            "project_type",
            "customer",
            "manager",
            "project_desc",
            "priority",
            "start_date",
            "deadline",
            "progress",
            "status"
        ]


class ReportSerializer(serializers.ModelSerializer):

    project = ProjectSerializer(read_only=True)

    class Meta:
        model = Reports
        fields = [
            "report_id",
            "report_status",
            "project"
        ]


class SuiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suites
        fields = "__all__"

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stages
        fields = "__all__"

class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tools
        fields = "__all__"

class ToolParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolParameter
        fields = "__all__"