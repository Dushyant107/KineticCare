import express from "express";
import { getUserProfile ,login , signup } from "../controller/userController.js";
import { saveExerciseData,getUserExerciseData } from "../controller/exerciseController.js";
import {protect} from "../controller/protectRoutes.js";

const mainRouter = express.Router();

mainRouter.get("/",(req,res)=>{
    res.send("Server Live and is being run");
})

mainRouter.get("/:id",getUserProfile);
mainRouter.post("/login",login);
mainRouter.post("/signup",signup);
mainRouter.post("/saveexercisedata",protect,saveExerciseData);
mainRouter.get("/mine",protect,getUserExerciseData);

export default mainRouter;