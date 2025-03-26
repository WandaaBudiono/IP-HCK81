import { BrowserRouter, Routes, Route } from "react-router";
import { useState } from "react";
import "./App.css";
import AuthLayout from "./layouts/AuthLayout";
import LoginLayout from "./layouts/LoginLayout";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CharacterList from "./Pages/CharacterPage";
import Profile from "./Pages/Profile";
import Favorite from "./Pages/FavCharacter";
import CharacterDetail from "./Pages/CharacterbyId";
import Question1 from "./Pages/sortingHatWizard/Question1";
import Question2 from "./Pages/sortingHatWizard/Question2";
import Question3 from "./Pages/sortingHatWizard/Question3";
import Question4 from "./Pages/sortingHatWizard/Question4";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Public routes */}
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>

        {/* Login & Register */}
        <Routes>
          <Route path="/login" element={<LoginLayout />}>
            <Route index element={<Login />} />
          </Route>
          <Route path="/register" element={<LoginLayout />}>
            <Route index element={<Register />} />
          </Route>
        </Routes>

        {/* Auth routes (protected) */}
        <Routes>
          <Route path="/character" element={<AuthLayout />}>
            <Route index element={<CharacterList />} />
          </Route>
          <Route path="/profile" element={<AuthLayout />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/favorite" element={<AuthLayout />}>
            <Route index element={<Favorite />} />
          </Route>
          <Route path="/character/:CharacterId" element={<AuthLayout />}>
            <Route index element={<CharacterDetail />} />
          </Route>

          <Route path="/sorting-hat" element={<AuthLayout />}>
            <Route path="1" element={<Question1 />} />
            <Route path="2" element={<Question2 />} />
            <Route path="3" element={<Question3 />} />
            <Route path="4" element={<Question4 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
