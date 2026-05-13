"use client";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Feed } from "./pages/Feed";
import { Hub } from "./pages/Hub";
import { Landing } from "./pages/Landing";
import { OpportunityDetail } from "./pages/OpportunityDetail";

export default function UnlockApp() {
  return (
    <BrowserRouter basename="/unlock">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/hub/:category" element={<Hub />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
