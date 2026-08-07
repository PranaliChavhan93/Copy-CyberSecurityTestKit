import { useState } from "react";
import { analyzeOutput } from "./aiClient";

/**
 * Shared "Pass Output to AI" flow used by every Tester tool-parameter
 * component (Amass, Netdiscover, Recon-ng, OWASP, Nmap, ...).
 *
 * Flow:
 *   1. Tester clicks "Pass Output to AI" -> confirm popup
 *   2. Confirm -> output is sent to /ai/analyze/
 *   3. Result popup shows the narrative + recommendation for what's next
 *   4. "Continue" is only enabled/effective when the backend says this
 *      stage looks complete (stage_complete === true); otherwise the
 *      tester is told why and can keep testing this stage.
 *
 * Props:
 *   output      - raw terminal/tool output text for this stage
 *   toolName    - display name of the tool, e.g. "Amass"
 *   stageCode   - INFO | SCAN | VULN | EXPLOIT | POST (current stage)
 *   onAdvanceStage - () => void, called when tester continues past a
 *                    stage the AI marked complete
 */
function AIAnalysisPanel({ output, toolName, stageCode, onAdvanceStage }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const hasOutput = Boolean(output && output.trim() && output !== "Waiting for execution...");

    const handlePassToAI = () => {
        if (!hasOutput) {
            alert("No output available! Please run the command first.");
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setShowResult(true);
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await analyzeOutput({ output, toolName, stageCode });

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || "AI analysis failed.");
            }
        } catch (err) {
            setError(err.message || "Error connecting to AI service.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => setShowConfirm(false);

    const closeResult = () => {
        setShowResult(false);
        setResult(null);
        setError("");
    };

    const handleContinue = () => {
        if (result?.stage_complete && onAdvanceStage) {
            onAdvanceStage();
        }
        closeResult();
    };

    return (
        <div className="ai-analysis-panel">
            <button
                type="button"
                className="pass-to-ai-btn"
                onClick={handlePassToAI}
            >
                <i className="fas fa-brain"></i> Pass Output to AI
            </button>

            {showConfirm && (
                <div className="popup-overlay" onClick={handleCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fas fa-brain"></i> AI Analysis</h3>
                        <div className="popup-message">
                            <p>Do you want to send this output to AI for analysis?</p>
                        </div>
                        <div className="popup-buttons">
                            <button className="popup-cancel-btn" onClick={handleCancel}>Cancel</button>
                            <button className="popup-confirm-btn" onClick={handleConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showResult && (
                <div className="popup-overlay" onClick={loading ? undefined : closeResult}>
                    <div className="popup-box analysis-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="analysis-popup-header">
                            <h3><i className="fas fa-robot"></i> AI Analysis Result</h3>
                            {!loading && (
                                <button className="close-popup-btn" onClick={closeResult}>
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>

                        <div className="analysis-popup-body">
                            {loading ? (
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <p>Analyzing with AI...</p>
                                    <p className="loading-subtext">This may take a few moments</p>
                                </div>
                            ) : error ? (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <p>{error}</p>
                                </div>
                            ) : result ? (
                                <>
                                    <div className={`stage-status ${result.stage_complete ? "complete" : "incomplete"}`}>
                                        <i className={`fas ${result.stage_complete ? "fa-check-circle" : "fa-hourglass-half"}`}></i>
                                        <span>{result.completeness_reason}</span>
                                    </div>
                                    <div className="analysis-content">
                                        {result.analysis.split("\n").map((line, index) => (
                                            <p key={index}>{line || "\u00A0"}</p>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <p>No analysis result available</p>
                                </div>
                            )}
                        </div>

                        <div className="analysis-popup-footer">
                            {!loading && result && !result.stage_complete && (
                                <button className="stay-btn" onClick={closeResult}>
                                    <i className="fas fa-arrow-left"></i> Keep Working on This Stage
                                </button>
                            )}
                            {!loading && result && result.stage_complete && (
                                <button className="continue-btn" onClick={handleContinue}>
                                    <i className="fas fa-check"></i> Continue to Next Stage
                                </button>
                            )}
                            {!loading && (error || !result) && (
                                <button className="stay-btn" onClick={closeResult}>Close</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .pass-to-ai-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .pass-to-ai-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .popup-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .popup-box {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }

                .popup-box h3 {
                    margin: 0 0 20px 0;
                    color: #1a1a1a;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .popup-message { margin-bottom: 20px; color: #444; line-height: 1.5; }

                .popup-buttons { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

                .popup-cancel-btn {
                    padding: 10px 24px; background: #e9ecef; color: #333; border: none;
                    border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;
                }
                .popup-cancel-btn:hover { background: #dee2e6; }

                .popup-confirm-btn {
                    padding: 10px 24px; background: #4a6cf7; color: white; border: none;
                    border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;
                }
                .popup-confirm-btn:hover { background: #3a5cd5; }

                .analysis-popup { max-width: 700px; max-height: 80vh; display: flex; flex-direction: column; }

                .analysis-popup-header {
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #e9ecef; padding-bottom: 15px; margin-bottom: 15px;
                }
                .analysis-popup-header h3 { margin: 0; }

                .close-popup-btn {
                    background: none; border: none; font-size: 20px; color: #999;
                    cursor: pointer; padding: 4px 8px; border-radius: 4px;
                }
                .close-popup-btn:hover { background: #f5f5f5; color: #333; }

                .analysis-popup-body { flex: 1; overflow-y: auto; margin-bottom: 15px; min-height: 100px; max-height: 400px; }

                .loading-container {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 40px 20px; text-align: center;
                }
                .spinner {
                    width: 50px; height: 50px; border: 4px solid #e9ecef; border-top: 4px solid #4a6cf7;
                    border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .loading-subtext { color: #999 !important; font-size: 14px !important; }

                .stage-status {
                    display: flex; align-items: center; gap: 10px;
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 15px;
                    font-size: 14px; font-weight: 500;
                }
                .stage-status.complete { background: #eafaf0; color: #1a7f4d; }
                .stage-status.incomplete { background: #fff8e6; color: #9a6b00; }

                .analysis-content {
                    background: #f8f9fa; padding: 20px; border-radius: 8px;
                    white-space: pre-wrap; font-family: inherit; line-height: 1.6; color: #333;
                }
                .analysis-content p { margin: 0 0 8px 0; }

                .error-message {
                    display: flex; align-items: center; gap: 12px; padding: 20px;
                    background: #fff5f5; border-radius: 8px; color: #dc3545;
                }
                .error-message i { font-size: 24px; }

                .analysis-popup-footer {
                    border-top: 1px solid #e9ecef; padding-top: 15px;
                    display: flex; justify-content: flex-end; gap: 10px;
                }

                .continue-btn {
                    padding: 10px 30px; background: #4a6cf7; color: white; border: none;
                    border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 500;
                    display: flex; align-items: center; gap: 8px;
                }
                .continue-btn:hover { background: #3a5cd5; }

                .stay-btn {
                    padding: 10px 24px; background: #e9ecef; color: #333; border: none;
                    border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;
                    display: flex; align-items: center; gap: 8px;
                }
                .stay-btn:hover { background: #dee2e6; }
            `}</style>
        </div>
    );
}

export default AIAnalysisPanel;
