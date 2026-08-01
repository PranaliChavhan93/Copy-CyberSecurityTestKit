from django.db import models

# Create your models here.
class AuditLogs(models.Model):
    event_id = models.IntegerField()
    event_name = models.CharField(max_length=50)
    level = models.CharField(max_length=10)
    unique_info = models.CharField(max_length=250)
    user = models.CharField(max_length=20)
    time = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.event_name
    