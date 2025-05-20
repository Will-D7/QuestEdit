const API_URL = "http://localhost:8000/api/editors";

export const getAllEditors = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const createEditor = async (editor) => {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editor),
  });
};

export const updateEditor = async (id, editor) => {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editor),
  });
};

export const deleteEditor = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};
