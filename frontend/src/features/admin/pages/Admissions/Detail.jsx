import { Head, Link, router } from '@inertiajs/react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';

import ConfirmDialog from '@/components/ConfirmDialog';
import DashboardLayout from '@/layouts/DashboardLayout';
import { formatAmount } from '@/services/commerceApi';

const statusColors = {
  new: 'info',
  contacted: 'warning',
  accepted: 'success',
  declined: 'error',
};

const paymentColors = {
  paid: 'success',
  pending: 'warning',
  refunded: 'secondary',
  failed: 'error',
  cancelled: 'default',
  expired: 'default',
  none: 'default',
  unlinked: 'default',
  no_program: 'default',
};

const enrollmentColors = {
  active: 'success',
  completed: 'info',
  withdrawn: 'error',
  suspended: 'warning',
  not_enrolled: 'default',
  unlinked: 'default',
  no_program: 'default',
};

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

function sourceLabel(value) {
  return String(value || 'website').replaceAll('_', ' ');
}

function DetailLine({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function AdmissionsDetail({ application, statusChoices = [] }) {
  const [notes, setNotes] = useState(application.internalNotes || '');
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [confirmEnrollOpen, setConfirmEnrollOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const postAction = (path, data = {}, loadingKey = path) => {
    setActionLoading(loadingKey);
    router.post(path, data, {
      preserveScroll: true,
      onFinish: () => setActionLoading(''),
    });
  };

  const canUseWorkflowActions = Boolean(application.linkedUser && application.program);
  const paymentStatus = application.paymentStatus || {};
  const enrollmentStatus = application.enrollmentStatus || {};

  const saveStatus = () => {
    postAction(
      `/admin/admissions/${application.id}/status/`,
      { status: selectedStatus, internalNotes: notes },
      'status',
    );
  };

  const markStatus = (status) => {
    setSelectedStatus(status);
    postAction(`/admin/admissions/${application.id}/status/`, { status, internalNotes: notes }, `status-${status}`);
  };

  return (
    <DashboardLayout
      role="admin"
      breadcrumbs={[
        { label: 'Admissions', href: '/admin/admissions/' },
        { label: application.fullName },
      ]}
    >
      <Head title={`Admission: ${application.fullName}`} />

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Button
            component={Link}
            href="/admin/admissions/"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="h4" fontWeight="bold">
                {application.fullName}
              </Typography>
              <Chip
                label={application.statusLabel}
                color={statusColors[application.status] || 'default'}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {application.email || application.phone} · {sourceLabel(application.source)} · {formatDateTime(application.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PersonAddAltIcon color="action" />
                    <Typography variant="h6">Applicant</Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                    }}
                  >
                    <DetailLine label="Full Name" value={application.fullName} />
                    <DetailLine label="Email" value={application.email} />
                    <DetailLine label="Phone" value={application.phone} />
                    <DetailLine label="WhatsApp" value={application.whatsapp} />
                    <DetailLine label="Education Level" value={application.educationLevel} />
                    {application.educationResult && (
                      <DetailLine
                        label="KCSE Mean Grade"
                        value={application.educationResult}
                      />
                    )}
                    <DetailLine label="Intake" value={application.intake} />
                  </Box>
                  {application.message && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Message
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {application.message}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SchoolIcon color="action" />
                    <Typography variant="h6">Course</Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                    }}
                  >
                    <DetailLine label="Linked Course" value={application.program?.name} />
                    <DetailLine label="Course Code" value={application.program?.code} />
                    <DetailLine label="Preferred Course" value={application.preferredProgramme} />
                    <DetailLine label="Campus" value={application.campus?.name || application.preferredCampus} />
                    <DetailLine label="Study Mode" value={application.studyModeLabel} />
                    <DetailLine label="Source" value={sourceLabel(application.source)} />
                  </Box>
                  {!application.program && (
                    <Alert severity="warning">
                      This application has a preferred course name but no linked course record.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Notes & Status</Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 190 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedStatus}
                        label="Status"
                        onChange={(event) => setSelectedStatus(event.target.value)}
                      >
                        {statusChoices.map((choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={saveStatus}
                      disabled={actionLoading === 'status'}
                    >
                      Save
                    </Button>
                  </Stack>
                  <TextField
                    label="Internal notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    minRows={5}
                    multiline
                    fullWidth
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Student Account</Typography>
                  {application.linkedUser ? (
                    <Alert severity="success">
                      Linked to {application.linkedUser.name}
                    </Alert>
                  ) : application.matchingUser ? (
                    <Alert severity="warning">
                      Matching account found for {application.matchingUser.email}
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      No student account is linked.
                    </Alert>
                  )}
                  <Stack spacing={1}>
                    {!application.linkedUser && application.matchingUser && (
                      <Button
                        variant="contained"
                        startIcon={<LinkIcon />}
                        onClick={() => postAction(`/admin/admissions/${application.id}/link-user/`, {}, 'link-user')}
                        disabled={actionLoading === 'link-user'}
                      >
                        Link Existing User
                      </Button>
                    )}
                    {!application.linkedUser && (
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddAltIcon />}
                        onClick={() => postAction(`/admin/admissions/${application.id}/create-user/`, {}, 'create-user')}
                        disabled={actionLoading === 'create-user'}
                      >
                        Create Student Account
                      </Button>
                    )}
                    {application.linkedUser?.editUrl && (
                      <Button component={Link} href={application.linkedUser.editUrl} variant="outlined">
                        Open User
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Payment</Typography>
                  <Box>
                    <Chip
                      label={paymentStatus.label || 'Unknown'}
                      color={paymentColors[paymentStatus.state] || 'default'}
                      variant={paymentStatus.state === 'paid' ? 'filled' : 'outlined'}
                    />
                    {paymentStatus.amountMinor != null && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatAmount(paymentStatus.amountMinor, paymentStatus.currency)}
                      </Typography>
                    )}
                    {paymentStatus.reference && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {paymentStatus.reference}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => postAction(`/admin/admissions/${application.id}/payment-order/`, {}, 'payment-order')}
                    disabled={!canUseWorkflowActions || actionLoading === 'payment-order' || paymentStatus.state === 'paid'}
                  >
                    Create Payment Order
                  </Button>
                  {paymentStatus.adminUrl && (
                    <Button component={Link} href={paymentStatus.adminUrl} variant="outlined">
                      Open Orders
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Enrollment</Typography>
                  <Chip
                    label={enrollmentStatus.label || 'Unknown'}
                    color={enrollmentColors[enrollmentStatus.state] || 'default'}
                    variant={enrollmentStatus.state === 'active' ? 'filled' : 'outlined'}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  {enrollmentStatus.enrolledAt && (
                    <Typography variant="body2" color="text.secondary">
                      Enrolled {formatDateTime(enrollmentStatus.enrolledAt)}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SchoolIcon />}
                    onClick={() => setConfirmEnrollOpen(true)}
                    disabled={!canUseWorkflowActions || Boolean(enrollmentStatus.enrollmentId)}
                  >
                    Direct Enroll
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6">Quick Status</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => markStatus('contacted')}
                    disabled={actionLoading === 'status-contacted'}
                  >
                    Mark Contacted
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => markStatus('accepted')}
                    disabled={actionLoading === 'status-accepted'}
                  >
                    Mark Accepted
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => markStatus('declined')}
                    disabled={actionLoading === 'status-declined'}
                  >
                    Mark Declined
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>

      <ConfirmDialog
        open={confirmEnrollOpen}
        onClose={() => setConfirmEnrollOpen(false)}
        onConfirm={() => {
          setConfirmEnrollOpen(false);
          postAction(`/admin/admissions/${application.id}/direct-enroll/`, {}, 'direct-enroll');
        }}
        title="Direct Enroll"
        message={`Enroll ${application.fullName} in ${application.program?.name || application.preferredProgramme}?`}
        confirmLabel="Enroll"
        confirmColor="success"
        loading={actionLoading === 'direct-enroll'}
      />
    </DashboardLayout>
  );
}
