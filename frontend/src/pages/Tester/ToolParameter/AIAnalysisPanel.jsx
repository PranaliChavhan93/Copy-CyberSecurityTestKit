import { useState } from "react";
import { analyzeOutput } from "./aiClient";
import "./ToolCommon.css";

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
                        <div className="popup-header">
                            <h3><i className="fas fa-brain"></i> AI Analysis</h3>
                        </div>
                        <div className="popup-body">
                            <div className="popup-message">
                                <p>Do you want to send this output to AI for analysis?</p>
                            </div>
                        </div>
                        <div className="popup-footer">
                            <div className="popup-buttons">
                                <button className="popup-cancel-btn" onClick={handleCancel}>Cancel</button>
                                <button className="popup-confirm-btn" onClick={handleConfirm}>Confirm</button>
                            </div>
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
        </div>
    );
}

export default AIAnalysisPanel;