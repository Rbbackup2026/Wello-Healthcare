"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../Components/MainRoute/CartContext";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { replaceCityText } from "../../utils/locationText";
import { API_BASE_URL } from "../../utils/api";

// ⭐ MATERIAL UI IMPORTS
import {
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ⭐ Toast Import
import { toast } from "react-toastify";

const ItemDetail = ({ id }) => {
  const { addToCart } = useCart();
  const { location } = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeFaqs = (faqs) => {
    if (Array.isArray(faqs)) {
      return faqs.filter(
        (faq) => faq && (faq.question?.trim() || faq.answer?.trim())
      );
    }

    if (typeof faqs === "string") {
      try {
        const parsedFaqs = JSON.parse(faqs);
        return normalizeFaqs(parsedFaqs);
      } catch {
        return [];
      }
    }

    return [];
  };

  const productDescription =
    product?.description ||
    product?.descrption ||
    product?.desc ||
    "";
  const renderedProductDescription = replaceCityText(productDescription, location.city, [
    product?.city,
    product?.lab?.city,
  ]);
  const productFaqs = normalizeFaqs(product?.faqs || product?.faq);

  const hasVisibleDescription = String(renderedProductDescription)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length > 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // ✅ Direct single product API — description bhi aayegi
        const res = await axios.get(`${API_BASE_URL}/get_product/${id}`);
        console.log("Fetched product details:", res.data.data); // Add this line
        setProduct(res.data.data);
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price || 0,
      });

      toast.success(`${product.name} Added to Cart!`, {
        position: "top-right",
        autoClose: 1500,
        theme: "colored",
      });
    }
  };

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}>Loading details...</Box>;
  if (!product) return <Box sx={{ textAlign: "center", py: 10 }}>Product details not found.</Box>;

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      {/* wello-main-content adds necessary padding to avoid overlap with sticky header */}
      <Box className="wello-main-content" sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 5 }}>
        <Grid container spacing={4} maxWidth="lg" sx={{ mx: "auto", px: 2 }}>

          {/* ---------------- LEFT SIDE ---------------- */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {product.name}
              </Typography>

              {/* TEST COUNT */}
              <Chip
                label={`${product.testCount || 1} Tests`}
                color="primary"
                variant="outlined"
                sx={{ mt: 2 }}
              />

              {/* SERVICE BOXES */}
              <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    bgcolor: "#039e9e",
                    color: "#fff",
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    width: 220,
                    textAlign: "center",
                  }}
                >
                  Home Sample Collection
                </Box>

                <Box
                  sx={{
                    bgcolor: "#039e9e",
                    color: "#fff",
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    width: 220,
                    textAlign: "center",
                  }}
                >
                  Online Reports
                </Box>
              </Box>

              {/* ✅ DESCRIPTION */}
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" fontWeight={600}>
                  Description
                </Typography>
                {hasVisibleDescription ? (
                  <Box
                    sx={{
                      mt: 1,
                      color: "text.secondary",
                      lineHeight: 1.8,
                      "& ul": { listStyleType: "disc", pl: 3 },
                      "& ol": { listStyleType: "decimal", pl: 3 },
                      "& p": { mb: 1 },
                      "& strong": { fontWeight: 700 },
                    }}
                    dangerouslySetInnerHTML={{ __html: renderedProductDescription }}
                  />
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Detailed information for this test will be available soon.
                  </Typography>
                )}
              </Box>

              {/* REMARKS */}
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  Test Remark
                </Typography>

                <Accordion elevation={1}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>
                      {product.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      This is the remark information about the urine test.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Card>
          </Grid>

          {/* ---------------- RIGHT SIDE (PRICE CARD) ---------------- */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                position: "sticky",
                top: "90px",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="primary">
                Rs {product.price?.toLocaleString() || 0}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.4, fontSize: "16px", bgcolor: "#1976d2" }}
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>

              {productFaqs.length > 0 && (
                <Box sx={{ mt: 4, textAlign: "left" }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    Frequently Asked Questions
                  </Typography>

                  {productFaqs.map((faq, index) => (
                    <Accordion
                      elevation={1}
                      key={`${faq.question}-${index}`}
                      sx={{
                        mb: 1.5,
                        border: "1px solid #e5e7eb",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700} color="text.primary">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          color="text.primary"
                          fontWeight={700}
                          lineHeight={1.7}
                        >
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Footer />
    </>
  );
};

export default ItemDetail;
