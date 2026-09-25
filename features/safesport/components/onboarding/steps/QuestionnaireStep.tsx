"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircleIcon, HeartIcon, BrainIcon, ActivityIcon, AlertTriangleIcon } from "lucide-react";
import type { AthleteOnboardingData, QuestionnaireResponse } from "../../../types/onboarding";

interface QuestionnaireStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface QuestionState {
  id: string;
  response?: QuestionnaireResponse;
  followUp?: Record<string, string>;
}

export function QuestionnaireStep({ data }: QuestionnaireStepProps) {
  const [responses, setResponses] = useState<Record<string, QuestionState>>({});

  const handleResponse = (questionId: string, response: QuestionnaireResponse) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        id: questionId,
        response,
        followUp: response === "yes" ? prev[questionId]?.followUp || {} : undefined,
      },
    }));
  };

  const handleFollowUp = (questionId: string, field: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        followUp: {
          ...(prev[questionId]?.followUp || {}),
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6" aria-label={`Questionnaire for ${data.profile.firstName}`}>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Let&apos;s get to know your health</h2>
            <p className="text-sm text-muted-foreground">
              These questions help your clinical team understand your history before your assessment.
              Answer honestly - positive responses help us keep you safe.
            </p>
          </div>

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex gap-3">
              <AlertCircleIcon className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-500 dark:text-blue-400">
                  This takes about 10-15 minutes
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your answers are saved automatically. You can take a break and finish later.
                </p>
              </div>
            </div>
          </div>

          <Accordion>
            {/* CARDIOVASCULAR */}
            <AccordionItem value="cardiovascular">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <HeartIcon className="size-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-semibold">Cardiovascular Health</p>
                    <p className="text-xs text-muted-foreground">Heart and circulation</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="cv_chest_pain"
                    question="Have you ever had chest pain, pressure, or discomfort during or after exercise?"
                    response={responses["cv_chest_pain"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("cv_chest_pain", field, value)}
                    followUp={responses["cv_chest_pain"]?.followUp}
                  />

                  <QuestionCard
                    id="cv_fainting"
                    question="Have you ever fainted or nearly fainted during or after exercise?"
                    response={responses["cv_fainting"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("cv_fainting", field, value)}
                    followUp={responses["cv_fainting"]?.followUp}
                  />

                  <QuestionCard
                    id="cv_palpitations"
                    question="Have you ever had a racing, pounding, or irregular heartbeat?"
                    response={responses["cv_palpitations"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("cv_palpitations", field, value)}
                    followUp={responses["cv_palpitations"]?.followUp}
                  />

                  <QuestionCard
                    id="cv_known_condition"
                    question="Have you been told you have a heart problem, murmur, high blood pressure, or abnormal heart test?"
                    response={responses["cv_known_condition"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("cv_known_condition", field, value)}
                    followUp={responses["cv_known_condition"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FAMILY CARDIAC */}
            <AccordionItem value="family_cardiac">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <HeartIcon className="size-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold">Family Cardiac History</p>
                    <p className="text-xs text-muted-foreground">Heart conditions in your family</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="fc_sudden_death"
                    question="Has anyone in your immediate family (parent, sibling) died unexpectedly or suddenly before age 50?"
                    response={responses["fc_sudden_death"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("fc_sudden_death", field, value)}
                    followUp={responses["fc_sudden_death"]?.followUp}
                    sensitive
                  />

                  <QuestionCard
                    id="fc_heart_disease"
                    question="Does anyone in your family have significant heart disease, cardiomyopathy, or inherited heart rhythm problems?"
                    response={responses["fc_heart_disease"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("fc_heart_disease", field, value)}
                    followUp={responses["fc_heart_disease"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* NEUROLOGIC */}
            <AccordionItem value="neurologic">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BrainIcon className="size-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold">Neurologic Health</p>
                    <p className="text-xs text-muted-foreground">Brain and nervous system</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="neuro_concussion"
                    question="Have you ever had a concussion or head injury?"
                    response={responses["neuro_concussion"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("neuro_concussion", field, value)}
                    followUp={responses["neuro_concussion"]?.followUp}
                  />

                  <QuestionCard
                    id="neuro_seizure"
                    question="Have you ever had a seizure?"
                    response={responses["neuro_seizure"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("neuro_seizure", field, value)}
                    followUp={responses["neuro_seizure"]?.followUp}
                  />

                  <QuestionCard
                    id="neuro_headache"
                    question="Do you experience significant or frequent headaches?"
                    response={responses["neuro_headache"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("neuro_headache", field, value)}
                    followUp={responses["neuro_headache"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* MUSCULOSKELETAL */}
            <AccordionItem value="musculoskeletal">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="size-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-semibold">Musculoskeletal Health</p>
                    <p className="text-xs text-muted-foreground">Bones, joints, and muscles</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="msk_previous_injury"
                    question="Have you had a previous significant injury (fracture, dislocation, ligament tear, muscle or tendon injury)?"
                    response={responses["msk_previous_injury"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("msk_previous_injury", field, value)}
                    followUp={responses["msk_previous_injury"]?.followUp}
                  />

                  <QuestionCard
                    id="msk_current_pain"
                    question="Do you currently have any pain, swelling, instability, or weakness affecting your sport?"
                    response={responses["msk_current_pain"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("msk_current_pain", field, value)}
                    followUp={responses["msk_current_pain"]?.followUp}
                  />

                  <QuestionCard
                    id="msk_surgery"
                    question="Have you had any surgery on bones, joints, or soft tissues?"
                    response={responses["msk_surgery"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("msk_surgery", field, value)}
                    followUp={responses["msk_surgery"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* RESPIRATORY */}
            <AccordionItem value="respiratory">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="size-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold">Respiratory Health</p>
                    <p className="text-xs text-muted-foreground">Breathing and lungs</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="resp_asthma"
                    question="Do you have asthma or exercise-induced breathing problems?"
                    response={responses["resp_asthma"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("resp_asthma", field, value)}
                    followUp={responses["resp_asthma"]?.followUp}
                  />

                  <QuestionCard
                    id="resp_inhaler"
                    question="Do you use an inhaler?"
                    response={responses["resp_inhaler"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("resp_inhaler", field, value)}
                    followUp={responses["resp_inhaler"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ALLERGY & MEDICATION */}
            <AccordionItem value="allergy">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="size-5 text-amber-500" />
                  <div className="text-left">
                    <p className="font-semibold">Allergies & Medication</p>
                    <p className="text-xs text-muted-foreground">Allergies and current medications</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="allergy_any"
                    question="Do you have any allergies (medication, food, environmental)?"
                    response={responses["allergy_any"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("allergy_any", field, value)}
                    followUp={responses["allergy_any"]?.followUp}
                  />

                  <QuestionCard
                    id="medication_regular"
                    question="Do you take any regular medication or supplements?"
                    response={responses["medication_regular"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("medication_regular", field, value)}
                    followUp={responses["medication_regular"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* GENERAL MEDICAL */}
            <AccordionItem value="general_medical">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="size-5 text-slate-500" />
                  <div className="text-left">
                    <p className="font-semibold">General Medical History</p>
                    <p className="text-xs text-muted-foreground">Other medical conditions</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="general_chronic"
                    question="Do you have any chronic illness or ongoing medical condition?"
                    response={responses["general_chronic"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("general_chronic", field, value)}
                    followUp={responses["general_chronic"]?.followUp}
                  />

                  <QuestionCard
                    id="general_hospitalization"
                    question="Have you been hospitalized or had major surgery?"
                    response={responses["general_hospitalization"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("general_hospitalization", field, value)}
                    followUp={responses["general_hospitalization"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* VISION & HEARING */}
            <AccordionItem value="vision_hearing">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="size-5 text-indigo-500" />
                  <div className="text-left">
                    <p className="font-semibold">Vision & Hearing</p>
                    <p className="text-xs text-muted-foreground">Sensory health</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="vision_hearing_problem"
                    question="Do you have any vision or hearing problems that affect your participation in sports?"
                    response={responses["vision_hearing_problem"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("vision_hearing_problem", field, value)}
                    followUp={responses["vision_hearing_problem"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SKIN & INFECTION */}
            <AccordionItem value="skin_infection">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="size-5 text-pink-500" />
                  <div className="text-left">
                    <p className="font-semibold">Skin & Infection</p>
                    <p className="text-xs text-muted-foreground">Skin conditions and infections</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="skin_condition"
                    question="Do you have any skin conditions or recurrent infections relevant to sports participation?"
                    response={responses["skin_condition"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("skin_condition", field, value)}
                    followUp={responses["skin_condition"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* MENTAL HEALTH */}
            <AccordionItem value="mental_health">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BrainIcon className="size-5 text-teal-500" />
                  <div className="text-left">
                    <p className="font-semibold">Mental Health & Wellbeing</p>
                    <p className="text-xs text-muted-foreground">Mental health and stress</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Mental health is important for athletic performance and overall wellbeing. 
                      Your responses are confidential and will help your clinical team support you.
                    </p>
                  </div>

                  <QuestionCard
                    id="mental_stress"
                    question="Are you experiencing significant stress, anxiety, low mood, or burnout?"
                    response={responses["mental_stress"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("mental_stress", field, value)}
                    followUp={responses["mental_stress"]?.followUp}
                    sensitive
                  />

                  <QuestionCard
                    id="mental_sleep"
                    question="Are you having significant sleep problems?"
                    response={responses["mental_sleep"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("mental_sleep", field, value)}
                    followUp={responses["mental_sleep"]?.followUp}
                    sensitive
                  />

                  <div className="rounded-lg border p-4 bg-card">
                    <p className="text-sm font-medium mb-2">Prefer to discuss privately?</p>
                    <p className="text-sm text-muted-foreground">
                      If you prefer to discuss mental health concerns privately with your clinician during your assessment, that option is available.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FEMALE ATHLETE HEALTH */}
            <AccordionItem value="female_athlete">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <HeartIcon className="size-5 text-rose-500" />
                  <div className="text-left">
                    <p className="font-semibold">Female Athlete Health</p>
                    <p className="text-xs text-muted-foreground">Menstrual and energy concerns</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      These questions are relevant to female athlete health and performance. 
                      Your responses help identify any concerns that may affect training or competition.
                    </p>
                  </div>

                  <QuestionCard
                    id="female_menstrual"
                    question="Do you have concerns about menstrual cycles, absent periods, or energy availability?"
                    response={responses["female_menstrual"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("female_menstrual", field, value)}
                    followUp={responses["female_menstrual"]?.followUp}
                    sensitive
                  />

                  <div className="rounded-lg border p-4 bg-card">
                    <p className="text-sm font-medium mb-2">Prefer to discuss privately?</p>
                    <p className="text-sm text-muted-foreground">
                      If you prefer to discuss these topics privately with your clinician, that option is available during your assessment.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* PREVIOUS RESTRICTION */}
            <AccordionItem value="previous_restriction">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertCircleIcon className="size-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-semibold">Previous Restrictions</p>
                    <p className="text-xs text-muted-foreground">Past medical clearance issues</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <QuestionCard
                    id="prev_restriction"
                    question="Have you ever been restricted from sport or exercise by a health professional?"
                    response={responses["prev_restriction"]?.response}
                    onResponse={handleResponse}
                    onFollowUp={(field, value) => handleFollowUp("prev_restriction", field, value)}
                    followUp={responses["prev_restriction"]?.followUp}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <AlertCircleIcon className="inline size-4 text-primary mr-2" />
              Your responses are being saved automatically. You can return to complete this later.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface QuestionCardProps {
  id: string;
  question: string;
  response?: QuestionnaireResponse;
  onResponse: (id: string, response: QuestionnaireResponse) => void;
  onFollowUp: (field: string, value: string) => void;
  followUp?: Record<string, string>;
  sensitive?: boolean;
}

function QuestionCard({ 
  id, 
  question, 
  response, 
  onResponse, 
  onFollowUp, 
  followUp,
  sensitive 
}: QuestionCardProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Label className="text-base font-medium flex-1">
            {question}
          </Label>
          {sensitive && (
            <Badge variant="outline" className="text-xs">Sensitive</Badge>
          )}
        </div>

        <RadioGroup value={response || ""} onValueChange={(value: string) => onResponse(id, value as QuestionnaireResponse)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${id}-no`} />
            <Label htmlFor={`${id}-no`} className="font-normal cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${id}-yes`} />
            <Label htmlFor={`${id}-yes`} className="font-normal cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unknown" id={`${id}-unknown`} />
            <Label htmlFor={`${id}-unknown`} className="font-normal cursor-pointer">I&apos;m not sure</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Progressive disclosure - show follow-up for yes */}
      {response === "yes" && (
        <div className="space-y-4 pt-4 border-t bg-muted/30 -m-4 mt-4 p-4 rounded-b-lg">
          <p className="text-sm font-medium text-muted-foreground">Tell us more about this:</p>
          
          <div className="space-y-2">
            <Label htmlFor={`${id}-details`} className="text-sm">Details</Label>
            <Textarea
              id={`${id}-details`}
              placeholder="Please describe..."
              value={followUp?.details || ""}
              onChange={(e) => onFollowUp("details", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-date`} className="text-sm">When did this occur?</Label>
              <Input
                id={`${id}-date`}
                type="text"
                placeholder="e.g., 2 years ago, June 2024"
                value={followUp?.dateOnset || ""}
                onChange={(e) => onFollowUp("dateOnset", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-status`} className="text-sm">Current status</Label>
              <Input
                id={`${id}-status`}
                type="text"
                placeholder="e.g., Fully recovered, Ongoing"
                value={followUp?.currentStatus || ""}
                onChange={(e) => onFollowUp("currentStatus", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-treatment`} className="text-sm">Treatment received (if any)</Label>
            <Input
              id={`${id}-treatment`}
              type="text"
              placeholder="e.g., Physiotherapy, Surgery, Medication"
              value={followUp?.treatment || ""}
              onChange={(e) => onFollowUp("treatment", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
