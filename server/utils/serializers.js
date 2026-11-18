function idOf(value) {
  if (!value) return null;
  return String(value._id || value);
}

function serializeEvidenceItem(item, { includeData = false } = {}) {
  if (!item) return null;
  return {
    name: item.name || "",
    mimeType: item.mimeType || "",
    size: item.size || 0,
    url: item.url || item.data || "",
    path: item.path || "",
    uploadedAt: item.uploadedAt,
    ...(includeData && item.data ? { data: item.data } : {}),
  };
}

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    uid: user.uid,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "Citizen",
    status: user.status || "Active",
    phone: user.phone || "",
    emailVerified: Boolean(user.emailVerified),
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializePost(post, { viewer, compact = false } = {}) {
  if (!post) return null;

  const data = post.toObject ? post.toObject() : { ...post };
  const viewerRole = viewer?.role || "Citizen";
  const isStaff = viewerRole === "Officer" || viewerRole === "Admin";
  const isOwner = viewer && String(data.user?._id || data.user) === String(viewer._id);
  const assignedId = data.assignedTo?._id || data.assignedTo;

  const response = {
    id: String(data._id),
    userId: idOf(data.user),
    authorName: data.authorName || data.user?.name || "Citizen",
    title: data.title,
    category: data.category,
    severity: data.severity,
    priority: data.priority,
    location: data.location,
    area: data.area,
    coordinates: data.coordinates || { lat: null, lng: null },
    description: data.description,
    incidentAt: data.incidentAt,
    status: data.status,
    verificationStatus: data.verificationStatus || "Pending",
    rejectionReason: data.rejectionReason || "",
    riskScore: data.riskScore || 0,
    riskLevel: data.riskLevel || "Low",
    resolutionStatus: data.resolutionStatus || "Awaiting Citizen",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isDeleted: Boolean(data.isDeleted),
    deletedAt: data.deletedAt || null,
    assignedAt: data.assignedAt || null,
    deadline: data.deadline || null,
    duplicateOf: idOf(data.duplicateOf),
    assignedTo: data.assignedTo
      ? {
          id: idOf(data.assignedTo),
          name: data.assignedTo.name || "",
          role: data.assignedTo.role || "Volunteer",
        }
      : null,
    statusHistory: compact ? [] : (data.statusHistory || []).map((entry) => ({
      status: entry.status,
      note: entry.note || "",
      changedAt: entry.changedAt,
      changedBy: entry.changedBy || {},
    })),
    evidence: compact
      ? (data.evidence || []).slice(0, 1).map((item) => serializeEvidenceItem(item))
      : (data.evidence || []).map((item) => serializeEvidenceItem(item, { includeData: false })),
    investigation: compact
      ? undefined
      : {
          status: data.investigation?.status || "Pending",
          observations: data.investigation?.observations || "",
          gps: data.investigation?.gps || { lat: null, lng: null, accuracy: null },
          evidence: (data.investigation?.evidence || []).map((item) =>
            serializeEvidenceItem(item),
          ),
          report: data.investigation?.report || "",
          startedAt: data.investigation?.startedAt || null,
          submittedAt: data.investigation?.submittedAt || null,
          submittedBy: data.investigation?.submittedBy || {},
        },
  };

  if (isStaff) {
    response.authorEmail = data.authorEmail || data.user?.email || "";
    response.internalNotes = (data.internalNotes || []).map((note) => ({
      note: note.note,
      addedAt: note.addedAt,
      addedBy: note.addedBy || {},
    }));
    response.correctiveActions = (data.correctiveActions || []).map((action) => ({
      action: action.action,
      note: action.note || "",
      performedAt: action.performedAt,
      performedBy: action.performedBy || {},
    }));
    response.assignedBy = data.assignedBy || {};
  } else if (isOwner) {
    response.correctiveActions = (data.correctiveActions || []).map((action) => ({
      action: action.action,
      note: action.note || "",
      performedAt: action.performedAt,
      performedBy: { name: action.performedBy?.name || "Officer" },
    }));
    response.assignedTo = data.assignedTo
      ? { id: idOf(data.assignedTo), name: data.assignedTo.name || "", role: "Volunteer" }
      : null;
  } else if (viewerRole === "Volunteer" && String(assignedId) === String(viewer?._id)) {
    response.assignedBy = data.assignedBy || {};
  } else {
    delete response.description;
    delete response.coordinates;
    delete response.area;
    delete response.evidence;
    delete response.investigation;
    delete response.correctiveActions;
  }

  if (!compact) {
    response.citizenResponses = (data.citizenResponses || []).map((item) => ({
      action: item.action,
      message: item.message || "",
      evidence: item.evidence ? serializeEvidenceItem(item.evidence) : null,
      respondedAt: item.respondedAt,
      respondedBy: item.respondedBy || {},
    }));
  }

  if (data.isDeleted) {
    response.deletedBy = isStaff ? data.deletedBy || {} : undefined;
  }

  return response;
}

export function serializeNotification(notification) {
  const data = notification.toObject ? notification.toObject() : notification;
  return {
    id: String(data._id),
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link,
    relatedPost: idOf(data.relatedPost),
    read: Boolean(data.read),
    readAt: data.readAt,
    createdAt: data.createdAt,
  };
}

export function serializeAlert(alert) {
  const data = alert.toObject ? alert.toObject() : alert;
  return {
    id: String(data._id),
    category: data.category,
    area: data.area,
    coordinates: data.coordinates,
    reportCount: data.reportCount,
    windowDays: data.windowDays,
    riskScore: data.riskScore,
    riskLevel: data.riskLevel,
    message: data.message,
    status: data.status,
    acknowledgedBy: data.acknowledgedBy,
    acknowledgedAt: data.acknowledgedAt,
    resolvedAt: data.resolvedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function serializeAudit(log) {
  const data = log.toObject ? log.toObject() : log;
  return {
    id: String(data._id),
    actorUid: data.actorUid,
    actorName: data.actorName,
    actorRole: data.actorRole,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    details: data.details,
    ip: data.ip,
    createdAt: data.createdAt,
  };
}
