import React from "react";
import {
  CardContainer,
  IconWrapper,
  Amount,
  Label,
  WavePattern,
} from "./InvoiceCard.styles";

// InvoiceCard component used to display a dashboard metric with gradient background
const InvoiceCard = ({ amount, label, icon, gradient }) => {
  return (
    <CardContainer gradient={gradient}>
      <IconWrapper>{icon}</IconWrapper>
      <Amount>{amount}</Amount>
      <Label>{label}</Label>
      <WavePattern />
    </CardContainer>
  );
};

export default InvoiceCard;
