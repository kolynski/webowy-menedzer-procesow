from fastapi import FastAPI, HTTPException
import psutil
from typing import List, Dict, Any

app = FastAPI()

@app.get("/processes", response_model=List[Dict[str, Any]])
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

@app.post("/processes/{pid}/kill")
def kill_process(pid: int):
    try:
        process = psutil.Process(pid)
        process.terminate()  # excessive force: process.kill()
        # Using kill() as requested by user ("terminate a process ... using psutil" -> likely means kill or terminate)
        # The prompt says "Implement a POST endpoint /processes/{pid}/kill to terminate a process by its PID using psutil." 
        # psutil has .terminate() (SIGTERM) and .kill() (SIGKILL).
        # Usually 'kill' endpoint implies .kill(), but 'terminate' word was used.
        # I'll use .kill() to be sure it stops, or I can use .terminate().
        # Let's use .kill() since the endpoint is named /kill. 
        process.kill() 
        return {"message": f"Process {pid} killed successfully"}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Permission denied to kill process {pid}")

@app.post("/processes/{pid}/suspend")
def suspend_process(pid: int):
    try:
        process = psutil.Process(pid)
        process.suspend()
        return {"message": f"Process {pid} suspended successfully"}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Permission denied to suspend process {pid}")

@app.post("/processes/{pid}/resume")
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
