import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";
import { api, type GroupDetail } from "./api";
import { Field, Loading, Modal, Notice, useResource } from "./ui";

/** H.U. 2.1: mismo flujo desde la publicación y desde el detalle del grupo. */
export function JoinGroupDialog({ groupId, close, sent }: {
  groupId: string;
  close: () => void;
  sent: () => void;
}) {
  const group = useResource<GroupDetail | null>(`/groups/${groupId}`, null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    const text = message.trim();
    if (!text) { setError("Escribe un mensaje para el administrador del grupo."); return; }
    if (text.length > 1000) { setError("El mensaje no puede superar los 1000 caracteres."); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.request<{ message: string }>(`/groups/${groupId}/join-requests`, "POST", { message: text });
      setSuccess(result.message || "Solicitud enviada con éxito");
      sent();
    } catch (e) {
      setError((e as Error).message);
      group.reload();
    } finally { submitting.current = false; setBusy(false); }
  }

  return <Modal title={success ? "Solicitud enviada" : `Unirme a ${group.data?.name || "grupo"}`} close={() => { if (!busy) close(); }}>
    {success ? <div className="join-success">
      <span className="confirmation-symbol"><CheckCircle2 size={30} aria-hidden="true" /></span>
      <p role="status"><strong>{success}</strong></p>
      <p className="muted">El administrador revisará tu solicitud. Por ahora queda pendiente de aprobación.</p>
      <div className="modal-actions"><button className="button" onClick={close} autoFocus>Entendido</button></div>
    </div> : group.loading ? <Loading /> : !group.data ? <>
      <Notice error>{group.error || "No se encontró el grupo."}</Notice>
      <button className="button secondary" onClick={group.reload}>Volver a intentar</button>
    </> : <>
      <p className="confirmation-copy">{group.data.member_count} de {group.data.max_capacity ?? "sin límite de"} integrantes · Administra {group.data.admin.name}</p>
      <Link className="text-button" to={`/grupos/${groupId}`} onClick={close}>Ver detalle del grupo</Link>
      <Notice error>{error}</Notice>
      {group.data.my_status === "none" ? <form className="form join-request-form" onSubmit={submit} noValidate aria-busy={busy}>
        <Field label="Preséntate al grupo" hint={`${message.length}/1000 caracteres`}>
          <textarea required maxLength={1000} rows={4} value={message} disabled={busy}
            onChange={(event) => { setMessage(event.target.value); setError(""); }}
            placeholder="Cuéntales qué te gustaría aprender…" />
        </Field>
        <button className="button full" disabled={busy}><Send size={16} />{busy ? "Enviando…" : "Enviar solicitud"}</button>
      </form> : <Notice>{group.data.my_status === "pending" ? "Ya tienes una solicitud pendiente para este grupo." : "Ya perteneces a este grupo."}</Notice>}
    </>}
  </Modal>;
}
