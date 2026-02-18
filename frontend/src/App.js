import {useState} from "react";
import "./App.css";

function App(){
  const[text,setText]=useState("");
  const[result,setResult]=useState(null);

  const analyze=async()=>{
    try{
      const res=await fetch("http://127.0.0.1:8000/analyze",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({text:text})

      });
      const data=await res.json();
      setResult(data.risk_score);
    }catch(err){
      console.error(err);
    }
  };

  return(
    <div style={{padding:"40px",fontFamily:"Arial"}}>
      <h1>FinShield Fraud Detector</h1>

      <textarea
        rows="6"
        cols="60"
        placeholder="Paste suspicious message here..."
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />

      <br/><br/>

      <button onClick={analyze}>
        Analyze
      </button>

      {result!==null && (
        <h2>Risk Score: {result}</h2>
      )}
    </div>
  );
}

export default App;
