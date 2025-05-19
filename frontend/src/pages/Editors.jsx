import EditorList from '../components/editor/EditorList';
import EditorForm from '../components/editor/EditorForm';
import { useState, useEffect } from 'react';
import { getEditors } from '../services/editorService';

function Editors() {
  const [editors, setEditors] = useState([]);
  const [editorToEdit, setEditorToEdit] = useState(null);

  useEffect(() => {
    getEditors().then(setEditors);
  }, []);

  return (
    <div className="editors-page">
      <h2>Gestión de Editores</h2>
      <EditorForm setEditors={setEditors} editor={editorToEdit} />
      <EditorList editors={editors} setEditorToEdit={setEditorToEdit} setEditors={setEditors} />
    </div>
  );
}

export default Editors;
