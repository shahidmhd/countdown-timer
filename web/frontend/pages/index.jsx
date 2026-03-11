import { useEffect, useState, useCallback } from "react";
import {
  Page, Card, Button, DataTable, Badge,
  EmptyState, Layout, Text, TextField,
  Stack, Box,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import TimerModal from "../components/TimerModal";

export default function Index() {
  const fetch = useAuthenticatedFetch();
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTimer, setEditTimer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const loadTimers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/timers");
      const data = await res.json();
      setTimers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [fetch]);

  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  const deleteTimer = async (id) => {
    if (!confirm("Delete this timer?")) return;
    await fetch("/api/timers/" + id, { method: "DELETE" });
    loadTimers();
  };

  const toggleActive = async (timer) => {
    await fetch("/api/timers/" + timer._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !timer.isActive }),
    });
    loadTimers();
  };

  const getStatus = (timer) => {
    const now = new Date();
    const start = new Date(timer.startDate);
    const end = new Date(timer.endDate);
    if (!timer.isActive) return <Badge tone="critical">Inactive</Badge>;
    if (now < start) return <Badge tone="warning">Scheduled</Badge>;
    if (now > end) return <Badge tone="attention">Expired</Badge>;
    return <Badge tone="success">Active</Badge>;
  };

  const filteredTimers = timers
    .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const rows = filteredTimers.map((t) => [
    <Stack direction="vertical" gap="100">
      <Text fontWeight="bold">{t.title}</Text>
      <Text variant="bodySm" tone="subdued">{t.description}</Text>
      <Text variant="bodySm" tone="subdued">
        Start: {new Date(t.startDate).toLocaleString()}
      </Text>
    </Stack>,
    getStatus(t),
    <Stack direction="horizontal" gap="200">
      <Button size="slim" onClick={() => { setEditTimer(t); setModalOpen(true); }}>
        Edit
      </Button>
      <Button size="slim" onClick={() => toggleActive(t)}>
        {t.isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button size="slim" tone="critical" onClick={() => deleteTimer(t._id)}>
        Delete
      </Button>
    </Stack>,
  ]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <Stack direction="vertical" gap="400">
                <Stack direction="horizontal" align="space-between" blockAlign="center">
                  <Stack direction="vertical" gap="100">
                    <Text variant="headingLg" as="h1">Countdown Timer Manager</Text>
                    <Text variant="bodySm" tone="subdued">
                      Create and manage countdown timers for your promotions
                    </Text>
                  </Stack>
                  <Button primary onClick={() => { setEditTimer(null); setModalOpen(true); }}>
                    + Create timer
                  </Button>
                </Stack>

                <Stack direction="horizontal" gap="300" blockAlign="center">
                  <div style={{ flex: 1 }}>
                    <TextField
                      placeholder="Search timers..."
                      value={searchQuery}
                      onChange={setSearchQuery}
                      clearButton
                      onClearButtonClick={() => setSearchQuery("")}
                      autoComplete="off"
                    />
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                    }}
                  >
                    <option value="newest">Sort: date (newest first)</option>
                    <option value="oldest">Sort: date (oldest first)</option>
                  </select>
                </Stack>

                {loading ? (
                  <Text>Loading timers...</Text>
                ) : filteredTimers.length === 0 ? (
                  <EmptyState
                    heading="No timers found"
                    action={{ content: "+ Create timer", onAction: () => setModalOpen(true) }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Create a countdown timer to boost your sales!</p>
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Timer", "Status", "Actions"]}
                    rows={rows}
                  />
                )}
              </Stack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <TimerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTimer(null); }}
        onSave={loadTimers}
        editTimer={editTimer}
      />
    </Page>
  );
}
