const express = require("express");
const router = express.Router();
const Notes = require("../Models/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// ROUTE 1 :   Getting all notes using POST : api/notes/fetchallnotes endpoint, login required

router.post("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    let notes = await Notes.find({ user: req.user.id });
    res.status(200).json({ notes });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Please Contact Support");
  }
});

// ROUTE 2 :   Adding a note using POST : api/notes/addnote endpoint, login required

router.post( "/addnote", fetchuser,
  [
    body("title", "Enter a specific title").isLength({ min: 3 }),
    body("description", "Description should be atleast 5 characters long").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //Check for incorrect values
    try {
      const { title, description, tag} = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      note.save();

      res.send(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Please Contact Support");
    }
  }
);

// ROUTE 3 :   Update an existing note using PUT : api/notes/updatenote endpoint, login required

router.put( "/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag} = req.body;

    //Creatinn a newNote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // find the note to be updated and Authenticating user
    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send('No notes found')}
    if(note.user.toString() !== req.user.id){
        return res.status(401).send('Unauthorized access');
    }
    
    // Updating note
    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
    res.send(note);
  })

  // ROUTE 4 :   Delete an existing note using DELETE : api/notes/deletenote endpoint, login required

router.delete( "/deletenote/:id", fetchuser, async (req, res) => {

    // find the note to be deleted and Authenticating user
    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send('No notes found')}
    if(note.user.toString() !== req.user.id){
        return res.status(401).send('Unauthorized access');
    }
    
    // Deleting note
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({'Success': 'Note has been deleted', note: note});
  })

module.exports = router;
