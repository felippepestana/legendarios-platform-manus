import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function FormStepper({ steps, currentStep, onStepClick }: FormStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={cn(
                "flex items-center gap-3 cursor-pointer group",
                index <= currentStep ? "opacity-100" : "opacity-50"
              )}
              onClick={() => onStepClick?.(index)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-[#FF4500] text-white ring-4 ring-[#FF4500]/20"
                    : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
                )}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="hidden lg:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index === currentStep ? "text-white" : "text-zinc-400"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-zinc-500">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  index < currentStep ? "bg-green-500" : "bg-zinc-800"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">
            Etapa {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm font-medium text-white">
            {steps[currentStep]?.title}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-[#FF4500] h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
