import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children, ownerOnly = false }) {
  const { account, isOwner } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/");
    else if (ownerOnly && !isOwner) navigate("/dashboard");
  }, [account, isOwner]);

  if (!account) return null;
  if (ownerOnly && !isOwner) return null;
  return children;
}