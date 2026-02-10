import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-10 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center justify-center w-1/5">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-green-500"
                  : currentStep === step.id
                  ? "bg-secondary text-info font-doto"
                  : "border border-gray-200 font-doto"
              }`}
            >
              {currentStep > step.id ? (
                <div className="h-6 w-6 flex justify-center items-center bg-info rounded-full">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`mt-2 transition-colors  ${
                currentStep >= step.id
                  ? "text-primary font-doto2"
                  : "text-gray-500 font-doto2"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
