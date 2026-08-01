export async function apiFetch(url, options = {}) {
    let access = localStorage.getItem("access");
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
        },
    });

    if (response.status === 401) {
        const refresh = localStorage.getItem("refresh");
        const refreshResponse = await fetch(
            "http://127.0.0.1:8000/api/token/refresh/",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    refresh: refresh
                })
            }
        );

        const refreshData = await refreshResponse.json();
        if(refreshResponse.ok){
            localStorage.setItem(
                "access",
                refreshData.access
            );

            response = await fetch(url,{
                ...options,
                headers:{
                    ...options.headers,
                    Authorization:`Bearer ${refreshData.access}`,
                    "Content-Type":"application/json",
                }
            });
        }
        else{
            localStorage.clear();
            window.location.href="/login";
        }
    }
    return response;
}
