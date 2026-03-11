import { useState, useEffect } from "react";
import {
  Modal, FormLayout, TextField,
  Select, Toast, Frame, Text, Stack,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

const DEFAULT_FORM = {
  title: "",
  description: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  display: { color: "#ff0000", size: "medium", position: "top" },
  urgency: { enabled: true, triggerMinutes: 5, type: "pulse" },
};

export default function TimerModal({ open, onClose, onSave, editTimer }) {
  const fetch = useAuthenticatedFetch();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (editTimer) {
      const start = new Date(editTimer.startDate);
      const end = new Date(editTimer.endDate);
      setForm({
        title: editTimer.title || "",
        description: editTimer.description || "",
        startDate: start.toISOString().split("T")[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split("T")[0],
        endTime: end.toTimeString().slice(0, 5),
        display: editTimer.display || DEFAULT_FORM.display,
        urgency: editTimer.urgency || DEFAULT_FORM.urgency,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editTimer, open]);

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      setToast("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        startDate: new Date(form.startDate + "T" + (form.startTime || "00:00")),
        endDate: new Date(form.endDate + "T" + (form.endTime || "23:59")),
        display: form.display,
        urgency: form.urgency,
      };
      const url = editTimer ? "/api/timers/" + editTimer._id : "/api/timers";
      const method = editTimer ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setToast(editTimer ? "Timer updated!" : "Timer created!");
      onSave();
      setTimeout(onClose, 1000);
    } catch (e) {
      setToast("Error saving timer");
    }
    setSaving(false);
  };

  return (
    <Frame>
      <Modal
        open={open}
        onClose={onClose}
        title={editTimer ? "Edit Timer" : "Create New Timer"}
        primaryAction={{ content: editTimer ? "Update timer" : "Create timer", onAction: handleSave, loading: saving }}
        secondaryActions={[{ content: "Cancel", onAction: onClose }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Timer name *"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Enter timer name"
              autoComplete="off"
            />
            <Stack direction="horizontal" gap="300">
              <div style={{ flex: 1 }}>
                <TextField label="Start date" type="date" value={form.startDate}
                  onChange={(v) => setForm({ ...form, startDate: v })} autoComplete="off" />
              </div>
              <div style={{ flex: 1 }}>
                <TextField label="Start time" type="time" value={form.startTime}
                  onChange={(v) => setForm({ ...form, startTime: v })} autoComplete="off" />
              </div>
            </Stack>
            <Stack direction="horizontal" gap="300">
              <div style={{ flex: 1 }}>
                <TextField label="End date" type="date" value={form.endDate}
                  onChange={(v) => setForm({ ...form, endDate: v })} autoComplete="off" />
              </div>
              <div style={{ flex: 1 }}>
                <TextField label="End time" type="time" value={form.endTime}
                  onChange={(v) => setForm({ ...form, endTime: v })} autoComplete="off" />
              </div>
            </Stack>
            <TextField
              label="Promotion description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="Enter promotion details"
              multiline={3}
              autoComplete="off"
            />
            <Stack direction="vertical" gap="100">
              <Text variant="bodyMd">Timer color</Text>
              <input
                type="color"
                value={form.display.color}
                onChange={(e) => setForm({ ...form, display: { ...form.display, color: e.target.value } })}
                style={{ width: "60px", height: "40px", border: "none", cursor: "pointer", borderRadius: "4px" }}
              />
            </Stack>
            <Stack direction="horizontal" gap="300">
              <div style={{ flex: 1 }}>
                <Select
                  label="Timer size"
                  options={[
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  value={form.display.size}
                  onChange={(v) => setForm({ ...form, display: { ...form.display, size: v } })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Timer position"
                  options={[
                    { label: "Top", value: "top" },
                    { label: "Bottom", value: "bottom" },
                  ]}
                  value={form.display.position}
                  onChange={(v) => setForm({ ...form, display: { ...form.display, position: v } })}
                />
              </div>
            </Stack>
            <Select
              label="Urgency notification"
              options={[
                { label: "Color pulse", value: "pulse" },
                { label: "Banner notification", value: "banner" },
                { label: "None", value: "none" },
              ]}
              value={form.urgency.type}
              onChange={(v) => setForm({ ...form, urgency: { ...form.urgency, type: v } })}
            />
            {form.urgency.type !== "none" && (
              <TextField
                label="Trigger urgency when X minutes remain"
                type="number"
                value={String(form.urgency.triggerMinutes)}
                onChange={(v) => setForm({ ...form, urgency: { ...form.urgency, triggerMinutes: Number(v) } })}
                autoComplete="off"
              />
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
      {toast && <Toast content={toast} onDismiss={() => setToast(null)} />}
    </Frame>
  );
}
