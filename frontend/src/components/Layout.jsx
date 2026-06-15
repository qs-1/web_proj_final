import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "./AppSidebar.jsx";
import { AppSidebar } from "./AppSidebar.jsx";
import { useState, useEffect } from "react";
import { api } from "../api/client";

function LayoutInner() {
  const { open, isMobile } = useSidebar();

  /* shared subjects/notes state — lifted here so sidebar & dashboard share it */
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/api/subjects/"), api.get("/api/notes/")])
      .then(([s, n]) => { setSubjects(s); setNotes(n); })
      .catch(() => {});
  }, []);

  const collapsed = !isMobile && !open;
  const marginLeft = isMobile ? 0 : collapsed ? 52 : 256;

  return (
    <>
      <AppSidebar
        subjects={subjects}
        setSubjects={setSubjects}
        notes={notes}
        setNotes={setNotes}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
      />
      <div
        className="layout-main"
        style={{
          marginLeft,
          transition: "margin-left 0.2s ease",
          minHeight: "100vh",
        }}
      >
        {isMobile && (
          <div className="layout-mobile-header">
            <SidebarTrigger />
            <span className="layout-brand">Folio</span>
          </div>
        )}
        <main className="layout-content">
          <Outlet context={{ subjects, setSubjects, notes, setNotes, activeSubject, setActiveSubject }} />
        </main>
      </div>
    </>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
