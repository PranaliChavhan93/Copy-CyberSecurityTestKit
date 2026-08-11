# from asyncio import all_tasks

# from django.urls import path
# from account.views import (
#     assign_tester,
#     customer_view,
#     data_format,
#     encryption,
#     login,
#     manager_projects,
#     parameter_list,
#     protocol_authentication,
#     protocol_details,
#     protocols_by_category,
#     run_amass,
#     save_output,
#     standard_rfc,
#     tester_list,
#     update_project_stage,
#     used_by,
#     used_in,
#     verify_totp,
#     setup_mfa,

#     profile,
#     update_profile,
#     change_password,

#     master_dashboard,

#     testmanager_creation,

#     user_creation,
#     user_view,
#     delete_user,
#     update_user,

#     project_creation,
#     project_view,

#     suites,
#     suite_create,

#     protocols,
#     protocol_creation,

#     osi_layers,
#     protocol_categories,
#     protocol_types,
#     transport_protocols,
#     communication_models,

#     reports,
#     evidence,

#     stages,
#     tools,
#     tools_create,

#     supportadmin_dashboard,
#     tester_dashboard,
#     testing,
#     tester_projects,

#     testmanager_dashboard,
#     admin_dashboard,
#     customer_dashboard,
#     tester_project_detail,
# )

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )


# urlpatterns = [
#     path('login/', login),
#     path('verify-totp/', verify_totp),
#     path('setup-mfa/', setup_mfa),
#     path('profile/', profile),
#     path('profile/update/', update_profile),
#     path('profile/change_password/',change_password),

#     # path('<int:user_id>/profile/', profile),
#     # path('<int:user_id>/profile/update/', update_profile),
#     # path('<int:user_id>/profile/change_password/', change_password),

#     path('master/', master_dashboard),

#     path('user/view/', user_view),
#     path('user/create/', user_creation),
#     path('user/delete/<str:user_id>/', delete_user),
#     path('user/update/<str:user_id>/', update_user),

#     path('projects/', project_view),
#     path('projects/create/', project_creation),

#     path('master/suites/', suites),
#     path('master/suites/create/', suite_create),

#     path('master/stages/', stages),
    
#     path('master/reports/', reports),
#     path('master/protocols/', protocols),
#     path('master/protocols/create/', protocol_creation),

#     path("master/protocols/categories/", protocol_categories),
#     path("master/protocols/types/", protocol_types),
#     path("master/protocols/osi-layers/", osi_layers),
#     path("master/protocols/transport-protocols/", transport_protocols),
#     path("master/protocols/communication-models/", communication_models),
#     path('master/protocols/used-in/', used_in),
#     path('master/protocols/used-by/', used_by),
#     path('master/protocols/data-format/', data_format),
#     path('master/protocols/protocol-authentication/', protocol_authentication),
#     path('master/protocols/encryption/', encryption),
#     # path('master/protocols/standard-rfc/', standard_rfc),
    
#     path("master/protocols/by-category/", protocols_by_category ),
#     path("master/protocols/details/<int:id>/", protocol_details ),

#     path('master/tools/', tools),
#     path('master/tools/all/', all_tasks),
#     path('master/tools/create/', tools_create),


#     path('admin/', admin_dashboard),
#     path('admin/user/', user_view),
#     path('admin/projects/', project_view),
#     path('admin/projects/create/', project_creation),
#     path('admin/reports/', supportadmin_dashboard),
#     path('admin/support-admin/', supportadmin_dashboard),


#     path('supportadmin/', supportadmin_dashboard),


#     path('testmanager/', testmanager_dashboard),
#     path('testmanagers/', testmanager_creation),

#     path('testmanager/projects/', manager_projects),
#     path("testmanager/projects/<int:id>/assign/", assign_tester),

#     path("testmanager/projects/<str:project_id>/assign/", assign_tester),


#     path('tester/', tester_dashboard),
#     path('testers/', tester_list),
#     path('tester/testing/', testing),

#     path('tester/projects/', tester_projects),
#     path("tester/testing/<str:project_id>/", testing),
#     path("tester/projects/<str:project_id>/stage/", tester_projects),

#     path("tester/evidence/", evidence),
#     path("tester/reports/", reports),

#     # path('tools/run/<str:project_id>/', run_tool_command),
#     path('tools/save-output/', save_output),
    
#     path("tester/projects/<str:project_id>/", tester_project_detail),
#     path("tester/projects/<str:project_id>/stage/", update_project_stage),
    

#     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair" ),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh" ),
    
#     path("tools/amass/", run_amass ),
#     path("tester/tool-parameters/", parameter_list),

#     path('customer/', customer_dashboard),
#     path("customers/", customer_view),

# ]


from asyncio import all_tasks

from django.urls import path
from account.views import (
    assign_tester,
    customer_projects,
    customer_view,
    data_format,
    encryption,
    get_suites,
    login,
    manager_projects,
    parameter_list,
    protocol_authentication,
    protocol_details,
    protocols_by_category,
    run_amass,
    run_command,
    save_output,
    standard_rfc,
    tester_list,
    testmanager_report,
    update_project_stage,
    used_by,
    used_in,
    verify_totp,
    setup_mfa,

    profile,
    update_profile,
    change_password,

    master_dashboard,

    testmanager_creation,

    user_creation,
    user_view,
    delete_user,
    update_user,

    project_creation,
    project_view,

    suites,
    suite_create,

    protocols,
    protocol_creation,

    osi_layers,
    protocol_categories,
    protocol_types,
    transport_protocols,
    communication_models,

    reports,
    evidence,

    stages,
    tools,
    tools_create,

    supportadmin_dashboard,
    tester_dashboard,
    testing,
    tester_projects,

    testmanager_dashboard,
    admin_dashboard,
    customer_dashboard,
    tester_project_detail,
    ai_analyze,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('login/', login),
    path('verify-totp/', verify_totp),
    path('setup-mfa/', setup_mfa),
    path('profile/', profile),
    path('profile/update/', update_profile),
    path('profile/change_password/',change_password),

    path('master/', master_dashboard),

    path('user/view/', user_view),
    path('user/create/', user_creation),
    path('user/delete/<str:user_id>/', delete_user),
    path('user/update/<str:user_id>/', update_user),

    path('projects/', project_view),
    path('projects/create/', project_creation),
    path('suites/', get_suites),

    path('master/suites/', suites),
    path('master/suites/create/', suite_create),

    path('master/stages/', stages),
    
    path('master/reports/', reports),
    path('master/protocols/', protocols),
    path('master/protocols/create/', protocol_creation),

    path("master/protocols/categories/", protocol_categories),
    path("master/protocols/types/", protocol_types),
    path("master/protocols/osi-layers/", osi_layers),
    path("master/protocols/transport-protocols/", transport_protocols),
    path("master/protocols/communication-models/", communication_models),
    path('master/protocols/used-in/', used_in),
    path('master/protocols/used-by/', used_by),
    path('master/protocols/data-format/', data_format),
    path('master/protocols/protocol-authentication/', protocol_authentication),
    path('master/protocols/encryption/', encryption),
    # path('master/protocols/standard-rfc/', standard_rfc),
    
    path("master/protocols/by-category/", protocols_by_category ),
    path("master/protocols/details/<int:id>/", protocol_details ),

    path('master/tools/', tools),
    path('master/tools/all/', all_tasks),
    path('master/tools/create/', tools_create),

    path('admin/', admin_dashboard),
    path('admin/user/', user_view),
    path('admin/projects/', project_view),
    path('admin/projects/create/', project_creation),
    path('admin/reports/', supportadmin_dashboard),
    path('admin/support-admin/', supportadmin_dashboard),

    path('supportadmin/', supportadmin_dashboard),

    path('testmanager/', testmanager_dashboard),
    path('testmanagers/', testmanager_creation),

    path('testmanager/projects/', manager_projects),
    path("testmanager/projects/<int:id>/assign/", assign_tester),
    path("testmanager/projects/<str:project_id>/assign/", assign_tester),
    path("testmanager/reports/", testmanager_report),

    path('tester/', tester_dashboard),
    path('testers/', tester_list),
    path('tester/testing/', testing),
    path("tester/testing/<str:project_id>/", testing),
    
    path('tester/projects/', tester_projects),
    
    path("tester/projects/<str:project_id>/", tester_project_detail),
    path("tester/projects/<str:project_id>/stage/", update_project_stage),
    path("tester/evidence/", evidence),
    path("tester/reports/", reports),

    # path('tools/run/<str:project_id>/', run_tool_command),
    path('tools/save-output/', save_output),
    
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    path("tools/amass/", run_amass),
    path("tester/tool-parameters/", parameter_list),
    path('tools/run/', run_command),
    path('ai/analyze/', ai_analyze),

    path('customer/', customer_dashboard),
    path("customers/", customer_view),
    
    path('customer/projects/', customer_projects),
]