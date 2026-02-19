import {useState,useEffect} from "react";
import "./App.css";

function App(){

  const[mode,setMode]=useState("text");
  const[text,setText]=useState("");
  const[file,setFile]=useState(null);
  const[result,setResult]=useState(null);
  const[history,setHistory]=useState([]);

  useEffect(()=>{
    const saved=localStorage.getItem("finshield_history");
    if(saved) setHistory(JSON.parse(saved));
  },[]);

  useEffect(()=>{
    localStorage.setItem("finshield_history",JSON.stringify(history));
  },[history]);

  const addToHistory=(type,score)=>{
    const entry={
      type:type,
      score:score,
      time:new Date().toLocaleString()
    };
    setHistory([entry,...history.slice(0,9)]);
  };

  const sendFile=async(endpoint,typeKey)=>{
    if(!file) return;

    const formData=new FormData();
    formData.append("file",file);

    const res=await fetch(`http://127.0.0.1:8000/${endpoint}`,{
      method:"POST",
      body:formData
    });

    const data=await res.json();
    setResult(data);

    const score=data[`${typeKey}_risk`];
    if(score!==undefined) addToHistory(typeKey,score);
  };

  const analyzeText=async()=>{
    const res=await fetch("http://127.0.0.1:8000/analyze",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:text})
    });
    const data=await res.json();
    setResult(data);
    if(data.text_risk!==undefined) addToHistory("Text",data.text_risk);
  };

  const score=result?.text_risk ?? result?.image_risk ?? result?.audio_risk ?? result?.video_risk;

  const riskClass=(s)=>{
    if(!s) return "";
    if(s<0.3) return "low";
    if(s<0.6) return "medium";
    return "high";
  };

  const explanation=(s)=>{
    if(!s) return "";
    if(s<0.3) return "No major fraud indicators detected.";
    if(s<0.6) return "Some suspicious patterns detected. Review recommended.";
    return "High fraud likelihood. Immediate action advised.";
  };

  return(
    <div className="dashboard">

      <aside className="sidebar">
        <h2>FinShield</h2>
        <button onClick={()=>{setMode("text");setResult(null);}}>Text</button>
        <button onClick={()=>{setMode("image");setResult(null);}}>Image</button>
        <button onClick={()=>{setMode("audio");setResult(null);}}>Audio</button>
        <button onClick={()=>{setMode("video");setResult(null);}}>Video</button>
      </aside>

      <main className="content">

        <header className="topbar">
          <h1>Fraud Detection Dashboard</h1>
        </header>

        {mode==="text" && (
          <div className="card">
            <h3>Analyze Suspicious Message</h3>
            <textarea rows="6"
              value={text}
              onChange={(e)=>setText(e.target.value)}
              placeholder="Paste suspicious message..."
            />
            <button onClick={analyzeText}>Analyze</button>
          </div>
        )}

        {(mode==="image"||mode==="audio"||mode==="video") && (
          <div className="card">
            <h3>Upload {mode.charAt(0).toUpperCase()+mode.slice(1)}</h3>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>

            {mode==="image" && <button onClick={()=>sendFile("analyze-image","image")}>Analyze</button>}
            {mode==="audio" && <button onClick={()=>sendFile("analyze-audio","audio")}>Analyze</button>}
            {mode==="video" && <button onClick={()=>sendFile("analyze-video","video")}>Analyze</button>}
          </div>
        )}

        {score!==undefined && (
          <div className="card">
            <h3>Risk Assessment</h3>

            <div className={`result ${riskClass(score)}`}>
              Score: {score}
            </div>

            <p className="explanation">{explanation(score)}</p>

            <div className="chart">
              <div className={`bar ${riskClass(score)}`}
                   style={{width:`${score*100}%`}}></div>
            </div>
          </div>
        )}

        <div className="card">
          <h3>Recent Scans</h3>

          {history.length===0 && <p>No scans yet</p>}

          {history.map((h,i)=>(
            <div key={i} className="history-item">
              <span>{h.type}</span>
              <span className={riskClass(h.score)}>{h.score}</span>
              <span>{h.time}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

export default App;
