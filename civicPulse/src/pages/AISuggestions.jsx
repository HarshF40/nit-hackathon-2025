import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './AISuggestions.css';

const AISuggestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { complaints = [], departmentName = '' } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (complaints.length > 0) {
      fetchAISuggestions();
    }
  }, []);

  const fetchAISuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare pending issues data for AI
      const pendingIssues = complaints.filter(c => 
        c.status === 'in-progress' || c.status === 'pending' || 
        c.status === 'current' || c.status === 'active' || 
        c.status === 'open' || c.status === 'new'
      );

      console.log('📊 Sending', pendingIssues.length, 'pending issues to AI');

      // Create detailed summary of issues
      const issuesSummary = pendingIssues.map((issue, index) => {
        return `Issue ${index + 1}:
- ID: ${issue.id}
- Type: ${issue.type}
- Description: ${issue.description}
- Location: ${issue.location}
- Priority: ${issue.priority}
- Date: ${issue.date}
- Reporter: ${issue.posterName || 'Anonymous'}`;
      }).join('\n\n');

      const query = `You are an expert municipal department advisor. Analyze the following ${pendingIssues.length} pending complaints for ${departmentName} and provide:

1. **Priority Analysis**: Identify which issues need immediate attention and why
2. **Resource Allocation**: Suggest optimal crew deployment and resource distribution
3. **Common Patterns**: Identify recurring problems and their root causes
4. **Preventive Measures**: Recommend actions to prevent similar issues in the future
5. **Estimated Resolution Time**: Provide realistic timelines for resolving each category of issues
6. **Cost Optimization**: Suggest ways to resolve issues efficiently while minimizing costs

Here are the pending complaints:

${issuesSummary}

Please provide a detailed, actionable analysis with specific recommendations for the ${departmentName}.`;

      console.log('🤖 Sending query to AI endpoint...');

      // Send to AI endpoint
      const response = await fetch('http://10.170.100.212:5000/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        throw new Error(`AI API returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setAiResponse(data.response);
        console.log('✅ AI response received');
      } else {
        throw new Error('AI API returned error status');
      }

    } catch (err) {
      console.error('❌ Failed to get AI suggestions:', err);
      setError(err.message || 'Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    if (!text) return null;

    // Split by sections (numbered items or bold headers)
    const sections = text.split(/\n(?=\d+\.|##|###|\*\*)/);
    
    return sections.map((section, index) => {
      // Check if it's a header
      if (section.startsWith('**') || section.startsWith('##')) {
        const headerText = section.replace(/\*\*|##|###/g, '').trim();
        return (
          <div key={index} className="ai-section-header">
            <FaLightbulb />
            <h3>{headerText}</h3>
          </div>
        );
      }
      
      // Check if it's a numbered item
      const numberMatch = section.match(/^(\d+)\.\s*\*\*(.*?)\*\*:?\s*([\s\S]*)/);
      if (numberMatch) {
        const [, number, title, content] = numberMatch;
        return (
          <div key={index} className="ai-section">
            <div className="section-number">{number}</div>
            <div className="section-content">
              <h4>{title}</h4>
              <p>{content.trim()}</p>
            </div>
          </div>
        );
      }

      // Regular paragraph
      return section.trim() ? (
        <p key={index} className="ai-paragraph">{section.trim()}</p>
      ) : null;
    });
  };

  return (
    <div className="ai-suggestions-page">
      <Navbar 
        title={`${departmentName} Portal`}
        subtitle="AI-Powered Insights & Recommendations"
      />

      <div className="ai-content">
        {/* Header Section */}
        <div className="ai-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          
          <div className="ai-title-section">
            <div className="ai-icon">
              <FaRobot size={50} />
            </div>
            <div>
              <h2>AI Analysis & Suggestions</h2>
              <p className="ai-subtitle">
                Analyzing {complaints.filter(c => 
                  c.status === 'in-progress' || c.status === 'pending' || 
                  c.status === 'current' || c.status === 'active'
                ).length} pending complaints for intelligent insights
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="ai-loading">
            <FaSpinner className="spinner" />
            <h3>AI is analyzing your complaints...</h3>
            <p>This may take a few moments. Please wait.</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="ai-error">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchAISuggestions}>
              Try Again
            </button>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !loading && (
          <div className="ai-response-container">
            <div className="response-header">
              <FaLightbulb />
              <h3>AI Recommendations</h3>
            </div>
            <div className="ai-response-content">
              {formatResponse(aiResponse)}
            </div>
            <div className="response-footer">
              <button className="refresh-button" onClick={fetchAISuggestions}>
                🔄 Regenerate Analysis
              </button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !aiResponse && complaints.length === 0 && (
          <div className="ai-no-data">
            <FaRobot size={80} />
            <h3>No Complaints to Analyze</h3>
            <p>There are no pending complaints available for AI analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
