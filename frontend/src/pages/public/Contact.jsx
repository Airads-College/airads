import { useState } from 'react';
import { Head } from "@inertiajs/react";
import { Box, Container, Typography, Grid, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, Alert } from "@mui/material";
import { LocationOn, Phone, Email, Language, Send, WhatsApp, Smartphone, Facebook } from "@mui/icons-material";
import TopNavbar from "../../components/common/TopNavbar";
import MainNavbar from "../../components/common/MainNavbar";
import Footer from "../../components/common/AIRADSFooter";
import { usePublicBrand } from "../../hooks/usePublicBrand";
import useInquirySubmission from "@/features/inquiries/hooks/useInquirySubmission";

const emptyContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "General Inquiry",
  message: "",
  website: "",
};

const Contact = () => {
  const brand = usePublicBrand();
  const [form, setForm] = useState(emptyContactForm);
  const {
    status,
    message: submissionMessage,
    errors,
    isSubmitting,
    submit,
    resetFeedback,
  } = useInquirySubmission();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== "idle") {
      resetFeedback();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await submit({
      ...form,
      kind: "general",
      source: "contact_page",
    });
    if (result.ok) {
      setForm(emptyContactForm);
    }
  };

  const campusContacts = [
    {
      name: "Kisumu City Campus",
      address: "Swan Centre, 2nd Floor",
      phone: "0715 057 262",
    },
    {
      name: "Eldoret City Campus",
      address: "Institute Plaza, 3rd Floor",
      phone: "0715 696 979",
    },
    {
      name: "Nakuru City Campus",
      address: "Tradeworld Building, 2nd Floor",
      phone: "0711 488 302",
    },
    {
      name: "Kericho Town Campus",
      address: "ACK Business Park, 2nd Floor",
      phone: "0729 976 885",
    },
    {
      name: "Bungoma Town Campus",
      address: "College Plaza, 3rd Floor, Opp. Main Stage",
      phone: "0715 771 316",
    },
    {
      name: "Lodwar Town Campus",
      address: "Equity Bank Building, Opp. National Bank",
      phone: "0719 818 645",
    },
    {
      name: "Maralal Town Campus",
      address: "Supa Sacco Building, 2nd Floor, Opp. Huduma Centre",
      phone: "0717 885 888",
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Head title="Contact - AIRADS College" />
      <TopNavbar />
      <MainNavbar />
      
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 8, md: 12 }, mt: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: { xs: 10, md: 12 } }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 4, color: brand.secondary, fontSize: { xs: '3rem', md: '4.5rem' } }}>
              Contact Us
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 800, mx: 'auto', fontWeight: 300, lineHeight: 1.6 }}>
              Get in touch with us for admissions, inquiries, or any information about 
              <Box component="span" sx={{ fontWeight: 600, color: brand.primary }}> AIRADS College</Box>.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: 96, height: 4, bgcolor: brand.primary, borderRadius: 2 }} />
            </Box>
          </Box>

          <Grid container spacing={8} sx={{ mb: 12 }}>
            {/* Contact Information */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ mb: 6, textAlign: { xs: 'center', lg: 'left' } }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 900, color: brand.secondary, mb: 2, position: 'relative', display: 'inline-block' }}>
                  Our Contacts
                  <Box sx={{ position: 'absolute', bottom: -8, left: 0, width: 80, height: 4, bgcolor: brand.primary, borderRadius: 2, margin: { xs: '0 auto', lg: 0 } }} />
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 3, fontSize: '1.125rem' }}>
                  We&apos;re here to help you every step of the way
                </Typography>
              </Box>
              
              {/* Head Office Card */}
              <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, mb: 6, border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: brand.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', mr: 2 }}>
                    HQ
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: brand.secondary }}>
                    Head Office
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 3, transition: 'background-color 0.3s', '&:hover': { bgcolor: brand.softBlue } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: brand.borderBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: brand.primary }}>
                      <LocationOn />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Institute Plaza, 3rd Floor
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 3, transition: 'background-color 0.3s', '&:hover': { bgcolor: brand.softBlue } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: brand.borderBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: brand.primary }}>
                      <Phone />
                    </Box>
                    <Typography component="a" href="tel:+254715696979" variant="body1" sx={{ fontWeight: 500, color: 'text.primary', textDecoration: 'none', '&:hover': { color: brand.primary } }}>
                      0715 696 979
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 3, transition: 'background-color 0.3s', '&:hover': { bgcolor: brand.softBlue } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: brand.borderBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: brand.primary }}>
                      <Email />
                    </Box>
                    <Typography component="a" href="mailto:info@airads.ac.ke" variant="body1" sx={{ fontWeight: 500, color: 'text.primary', textDecoration: 'none', '&:hover': { color: brand.primary } }}>
                      info@airads.ac.ke
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 3, transition: 'background-color 0.3s', '&:hover': { bgcolor: brand.softBlue } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: brand.borderBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: brand.primary }}>
                      <Language />
                    </Box>
                    <Typography component="a" href="https://www.airads.ac.ke" target="_blank" rel="noopener noreferrer" variant="body1" sx={{ fontWeight: 500, color: 'text.primary', textDecoration: 'none', '&:hover': { color: brand.primary } }}>
                      www.airads.ac.ke
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Campus Contacts Card */}
              <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s', '&:hover': { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: brand.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mr: 2 }}>
                    <Smartphone />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: brand.secondary }}>
                    Campus Contact Numbers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {campusContacts.map((campus, index) => (
                    <Box
                      key={campus.name}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, p: 2, bgcolor: brand.softBlue, borderRadius: 3, transition: 'all 0.3s', '&:hover': { bgcolor: brand.borderBlue, transform: 'scale(1.02)' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: brand.borderBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: brand.primary }}>{index + 1}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>{campus.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{campus.address}</Typography>
                        </Box>
                      </Box>
                      <Typography
                        component="a"
                        href={`tel:${campus.phone.replaceAll(" ", "")}`}
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: brand.primary, px: 2, py: 0.5, borderRadius: 4, bgcolor: brand.borderBlue, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background-color 0.2s', '&:hover': { bgcolor: brand.softBlue, color: brand.primaryHover } }}
                      >
                        {campus.phone}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Inquiry Form */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ mb: 6, textAlign: { xs: 'center', lg: 'left' } }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 900, color: brand.secondary, mb: 2, position: 'relative', display: 'inline-block' }}>
                  Send us an Inquiry
                  <Box sx={{ position: 'absolute', bottom: -8, left: 0, width: 80, height: 4, bgcolor: brand.primary, borderRadius: 2, margin: { xs: '0 auto', lg: 0 } }} />
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 3, fontSize: '1.125rem' }}>
                  We&apos;ll get back to you within 24 hours
                </Typography>
              </Box>
              
              <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s', '&:hover': { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
                <Box
                  aria-hidden="true"
                  sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}
                >
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </Box>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      name="name"
                      label="Full Name" 
                      variant="outlined" 
                      placeholder="Enter your full name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      error={Boolean(errors.name?.length)}
                      helperText={errors.name?.[0] || ""}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'grey.50' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      name="email"
                      label="Email Address" 
                      type="email"
                      variant="outlined" 
                      placeholder="Enter your email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      error={Boolean(errors.email?.length)}
                      helperText={errors.email?.[0] || ""}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'grey.50' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      name="phone"
                      label="Phone Number" 
                      type="tel"
                      variant="outlined" 
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      error={Boolean(errors.phone?.length)}
                      helperText={errors.phone?.[0] || ""}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'grey.50' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'grey.50' } }}>
                      <InputLabel>Subject</InputLabel>
                      <Select
                        name="subject"
                        label="Subject"
                        value={form.subject}
                        onChange={handleChange}
                      >
                        <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                        <MenuItem value="Admissions">Admissions</MenuItem>
                        <MenuItem value="Course Information">Course Information</MenuItem>
                        <MenuItem value="Campus Visit">Campus Visit</MenuItem>
                        <MenuItem value="Financial Aid">Financial Aid</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField 
                      fullWidth 
                      name="message"
                      label="Message" 
                      multiline
                      rows={6}
                      variant="outlined" 
                      placeholder="Tell us how we can help you..."
                      required
                      value={form.message}
                      onChange={handleChange}
                      error={Boolean(errors.message?.length)}
                      helperText={errors.message?.[0] || ""}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'grey.50' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button 
                      type="submit"
                      variant="contained"
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      endIcon={<Send />}
                      sx={{ 
                        py: 2, 
                        borderRadius: 3, 
                        bgcolor: brand.primary,
                        fontWeight: 'bold', 
                        fontSize: '1.125rem',
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: brand.primaryHover, transform: 'scale(1.02)', boxShadow: 6 }
                      }}
                    >
                      {isSubmitting ? "Sending" : "Send Message"}
                    </Button>
                  </Grid>
                  {(status === "success" || status === "error") && (
                    <Grid size={{ xs: 12 }}>
                      <Alert
                        severity={status === "success" ? "success" : "error"}
                        role={status === "success" ? "status" : "alert"}
                      >
                        {submissionMessage}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Additional Contact Methods */}
          <Paper 
            sx={{ 
              p: { xs: 4, md: 8 }, 
              borderRadius: 6, 
              bgcolor: brand.secondary,
              color: 'white', 
              textAlign: 'center', 
              boxShadow: 24
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography variant="h3" component="h3" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                Other Ways to Reach Us
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 6, maxWidth: 800, mx: 'auto', fontWeight: 300 }}>
                Choose your preferred communication method for faster support
              </Typography>
              
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ transition: 'all 0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
                    <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}>
                      <WhatsApp sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>WhatsApp</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                      Send us a WhatsApp message for quick responses and instant support
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ transition: 'all 0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
                    <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}>
                      <Facebook sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Facebook Messenger</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                      Connect with us through Facebook Messenger for social support
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ transition: 'all 0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
                    <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}>
                      <Phone sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Call/SMS</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                      Call or send SMS to any of our campus numbers for direct communication
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<Phone />} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', px: 4, py: 1.5, borderRadius: 8, fontWeight: 600, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)', transform: 'scale(1.05)' } }}>
                  Call Now
                </Button>
                <Button variant="contained" startIcon={<WhatsApp />} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', px: 4, py: 1.5, borderRadius: 8, fontWeight: 600, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)', transform: 'scale(1.05)' } }}>
                  WhatsApp
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Contact;
