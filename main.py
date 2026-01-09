from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
import psutil
from typing import List, Dict, Any

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "supersecretapikey"  # In production, use environment variables
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key == API_KEY:
        return api_key
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key",
    )

@app.get("/processes", response_model=List[Dict[str, Any]], dependencies=[Depends(get_api_key)])
def get_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'status', 'memory_percent']):
        try:
            # Fetch process info; process_iter yields a Process object
            # passing attrs to process_iter is more efficient than accessing attributes one by one
            # but we can also access proc.info since we passed the attrs list
            process_info = proc.info
            processes.append(process_info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            # Process might have terminated or we don't have permission
            continue
        except Exception as e:
            # Generic error handling as requested, though usually specific is better
            print(f"Error accessing process: {e}")
            continue
            
    return processes

@app.post("/processes/{pid}/kill", dependencies=[Depends(get_api_key)])
def kill_process(pid: int):
    try:
        process = psutil.Process(pid)
        process.kill() 
        try:
            process.wait(timeout=3)
        except psutil.TimeoutExpired:
            pass
        return {"message": f"Process {pid} killed successfully"}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Permission denied to kill process {pid}")

@app.post("/processes/{pid}/suspend", dependencies=[Depends(get_api_key)])
def suspend_process(pid: int):
    try:
        process = psutil.Process(pid)
        process.suspend()
        return {"message": f"Process {pid} suspended successfully"}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Permission denied to suspend process {pid}")

@app.post("/processes/{pid}/resume", dependencies=[Depends(get_api_key)])
def resume_process(pid: int):
    try:
        process = psutil.Process(pid)
        process.resume()
        return {"message": f"Process {pid} resumed successfully"}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Permission denied to resume process {pid}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
