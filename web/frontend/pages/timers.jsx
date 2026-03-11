import { useEffect, useState } from "react";
import {
  Page, Card, DataTable, Button, Badge,
  EmptyState, Layout, Banner
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function TimerList() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = async () => {
    const res = await fetch("/api/timers");
    const data = await res.json();
    setTimers(data);
    setLoading(false);
  };

  const deleteTimer = async (id) => {
    await fetch(`/api/timers/${id}`, { method: "DELETE" });
    loadTimers();
  };

  const rows = timers.map((t) => [
    t.title,
    t.description,
    new Date(t.startDate).toLocaleDateString(),
    new Date(t.endDate).toLocaleDateString(),
    <Badge status={t.isActive ? "success" : "critical"}>
      {t.isActive ? "Active" : "Inactive"}
    </Badge>,
    <Button destructive size="slim" onClick={() => deleteTimer(t._id)}>
      Delete
    </Button>,
  ]);

  return (
    <Page
      title="Countdown Timers"
      primaryAction={{
        content: "Create Timer",
        onAction: () => navigate("/timersNew"),
      }}
    >
      <Layout>
        <Layout.Section>
          {timers.length === 0 ? (
            <EmptyState
              heading="No timers yet"
              action={{ content: "Create Timer", onAction: () => navigate("/timersNew") }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Create countdown timers to boost your sales!</p>
            </EmptyState>
          ) : (
            <Card>
              <DataTable
                columnContentTypes={["text","text","text","text","text","text"]}
                headings={["Title","Description","Start","End","Status","Action"]}
                rows={rows}
              />
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}