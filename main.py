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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
