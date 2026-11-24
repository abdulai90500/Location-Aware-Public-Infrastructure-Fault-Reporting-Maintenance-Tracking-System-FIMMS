import os
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.schemas import AIClassificationResponse
from backend.app.services.ai_classifier import classify_fault_image

router = APIRouter(prefix="/api/ai", tags=["AI & Machine Learning"])


@router.post("/classify-image", response_model=AIClassificationResponse)
async def classify_image(
    file: Optional[UploadFile] = File(None),
    filename_hint: Optional[str] = Form(None),
    description_hint: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    AI-driven automated defect classification:
    Analyzes visual input to suggest infrastructure category, confidence, severity, and tags.
    """
    name_to_check = (file.filename if file else "") + " " + (filename_hint or "")
    hint = description_hint or ""

    result = classify_fault_image(name_to_check, hint, db=db)
    return AIClassificationResponse(**result)
