import express, { Request, Response } from "express"; 
import path from "path";
import bodyParser from "body-parser";

const port = "3000";

const app = express();
const server = app.listen(port, () => {
    console.log("Listening on port: " + port);
});

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req: Request, res: Response) => {
  res.render("pages/index");
});

app.post("/room", (req: Request, res: Response) => {
  const userName = req.body.username;
  
  res.render("pages/room", { user: userName });
});

const io = require('socket.io')(server);
const connections = new Map();

io.on('connection', function(client: any) {

  client.on('user', (newUser: any) => {
    connections.set(client.id, newUser);
    sendAllUsersConnected();
  });

  client.on('message', (data: any) => {
    io.emit('message',  { user: data.user, message: data.message });
  });

  client.on('disconnect', () => {
    connections.delete(client.id);
  });
});

function sendAllUsersConnected() {
  io.emit('user',  { users: Array.from(connections.values()) });
}

export default server; 