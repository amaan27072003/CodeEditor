import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import { useNavigate, useLocation, useParams, Navigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Socket Error", err);
        toast.error("Socket connection failed");
        navigate("/");
      };

      socketRef.current.emit("join_room", {
        roomId,
        username: location.state?.username,
      });
      socketRef.current.on("user_joined", ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
        }
        setClients(clients);
        socketRef.current.emit("sync_code", { code: "" });
      });

      //  code for the disconnection
      socketRef.current.on("user_left", ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev)=>{
          return prev.filter(
            (client) => client.socketId!= socketId
          )
        })
      })



    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("user_joined");
      socketRef.current.off("user_left");
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const leaveRoom = () => {
    socketRef.current.emit("leave_room", { roomId });
    navigate("/");
  };

  const copyRoomId = async() => {
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    }catch(err){
      toast.error("Failed to copy Room ID");
      console.error(err);

    }
  };

  return (
    <div className="container-fluid vh-100">
      <ToastContainer /> {/* Added ToastContainer */}
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.5)" }}
        >
          <img
            className="img-fluid mx-auto"
            src="/images/code-sync.png"
            alt="code-sync"
            style={{ maxWidth: "150px", marginTop: "10px" }}
          />
          <hr />
          <div className="d-flex flex-column overflow-auto">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <div className="mt-auto">
            <hr />
            <button onClick={copyRoomId} className="btn btn-success btn-block">Copy Room ID</button>
            <button onClick={leaveRoom} className="btn btn-danger btn-block mt-2 mb-2 px-3 btn-block">
              Leave Room
            </button>
          </div>
        </div>
        <div className="col-md-10 text-light d-flex flex-column h-100">
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => (codeRef.current = code)}/>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
