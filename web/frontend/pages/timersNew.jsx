import { useState } from "react";
import {
  Page, Card, FormLayout, TextField,
  Button, Layout, Select, ColorPicker, Toast, Frame
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function TimerForm() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    display: { color: "#ff0000", bgColor: "#fff3cd", position: "top" },
    urgency: { enabled: true, triggerMinutes: 5, type: "pulse" },
  });

  const handleSubmit = async () => {
    await fetch("/api/timers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setToast(true);
    setTimeout(() => navigate("/timers"), 1500);
  };

  const positionOptions = [
    { label: "Top of page", value: "top" },
    { label: "Bottom of page", value: "bottom" },
  ];

  const urgencyOptions = [
    { label: "Color Pulse", value: "pulse" },
    { label: "Banner", value: "banner" },
  ];

  return (
    <Frame>
      <Page
        title="Create Countdown Timer"
        breadcrumbs={[{ content: "Timers", onAction: () => navigate("/timers") }]}
      >
        <Layout>
          <Layout.Section>
            <Card sectioned title="Timer Details">
              <FormLayout>
                <TextField
                  label="Title"
                  value={form.title}
                  onChange={(v) => setForm({ ...form, title: v })}
                  placeholder="e.g. Flash Sale Timer"
                />
                <TextField
                  label="Promotion Description"
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="e.g. Hurry! Sale ends soon"
                  multiline={2}
                />
                <TextField
                  label="Start Date & Time"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(v) => setForm({ ...form, startDate: v })}
                />
                <TextField
                  label="End Date & Time"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(v) => setForm({ ...form, endDate: v })}
                />
              </FormLayout>
            </Card>

            <Card sectioned title="Display Options">
              <FormLayout>
                <Select
                  label="Position"
                  options={positionOptions}
                  value={form.display.position}
                  onChange={(v) =>
                    setForm({ ...form, display: { ...form.display, position: v } })
                  }
                />
                <Select
                  label="Urgency Effect"
                  options={urgencyOptions}
                  value={form.urgency.type}
                  onChange={(v) =>
                    setForm({ ...form, urgency: { ...form.urgency, type: v } })
                  }
                />
                <TextField
                  label="Urgency Trigger (minutes before end)"
                  type="number"
                  value={String(form.urgency.triggerMinutes)}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      urgency: { ...form.urgency, triggerMinutes: Number(v) },
                    })
                  }
                />
              </FormLayout>
            </Card>

            <Button primary onClick={handleSubmit}>
              Save Timer
            </Button>
          </Layout.Section>
        </Layout>
        {toast && (
          <Toast content="Timer created!" onDismiss={() => setToast(false)} />
        )}
      </Page>
    </Frame>
  );
}