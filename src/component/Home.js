import { Toast } from 'bootstrap';
import React,{ useState } from 'react';
import toast from 'react-hot-toast';
import { generatePath } from 'react-router';
import {v4 as uuid} from "uuid";
import { useNavigate } from 'react-router-dom';

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Room Id Created Successfully");
  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID and Username is required");
      return;
    }  
    // Navigation process should be performed here.
    navigate(`/editor/${roomId}`,{state: {username}});
    toast.success("Joined Room Successfully");
  };
  return (
    <div className='container-fluid'>
      <div className='row justify-content-center align-items-center min-vh-100'>
        <div className='col-12 col-md-6'>
          <div className='card shadow-sm p-2 mb-5 bg-secondary rounded'>

            <div className='card-body text-center bg-dark'>
              <img className='img-fluid mx-auto d-block' src='/images/code-sync.png' alt='code-sync'
                style={{maxwidth: '150px'}}
              />

              <h4 className='text-light'>Enter The room ID </h4>

              <div className='form-group'>
                <input value={roomId} onChange={(e) => setRoomId(e.target.value)} type='text' className='form-control mb-2' placeholder='Room Id' />  
              </div>

              <div className='form-group'>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type='text' className='form-control mb-2' placeholder='Username' />  
              </div>
              
              <button onClick={joinRoom} type='submit' className=' mt-2 btn btn-success'>Join Room</button>

              <p className='mt-3 text-light'>Don't have a room?{" "} <span className='text-success p-2' style={{cursor: 'pointer'}}onClick={generateRoomId}>New Room</span></p>

            </div>

          </div>
        </div>
      </div>  
    </div>
  )
}

export default Home