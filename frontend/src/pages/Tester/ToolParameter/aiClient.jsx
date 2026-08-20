const API = "http://127.0.0.1:8000";

/**
 * Sends a stage's raw tool output to the backend AI advisor and returns its
 * recommendation for what to do next, plus whether this stage looks
 * complete enough to move on.
 *
 * @param {Object} params
 * @param {string} params.output    - raw terminal/tool output text
 * @param {string} params.toolName  - e.g. "Amass", "Nmap"
 * @param {string} [params.stageCode] - INFO | SCAN | VULN | EXPLOIT | POST
 * @returns {Promise<Object>} parsed JSON response from /ai/analyze/
 */
export async function analyzeOutput({ output, toolName, stageCode }) {
    const token = sessionStorage.getItem("access");

    const response = await fetch(`${API}/ai/analyze/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            output,
            tool_name: toolName,
            stage: stageCode,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || `AI analysis failed (${response.status})`);
    }

    return data;
}
