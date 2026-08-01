
from audits.models import AuditLogs


def create_log(event_id, event_name, level, unique_info, user):
    AuditLogs.objects.create(
        event_id = event_id,
        event_name = event_name,
        level = level,
        unique_info = unique_info,
        user = user
    )
