const mongoose = require("mongoose");
const Document = require("./model/Document");
const cors = require('cors');
mongoose.connect("mongodb+srv://onworkonline9892:FNEUmeXvlbi9oNMh@majorproject.zqrazwf.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const defaultValue = " ";

const io = require("socket.io")(3001, {
    cors: {
        origin: "https://editor-nine-rho.vercel.app",
        methods: ["GET", "POST"],
    }
}

);


io.on("connection", socket => {

    socket.on('get-document', async documentId => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })
        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
    console.log("Connection Succesfull");
})

async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);

    if (document) return document;

    return await Document.create({ _id: id, data: defaultValue });

}