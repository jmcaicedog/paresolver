import Image from "next/image"
import { Reveal } from "@/components/reveal"

const plans = [
  { amount: "$3,000", dollars: "$68", cents: ".42" },
  { amount: "$5,000", dollars: "$96", cents: ".55" },
  { amount: "$10,000", dollars: "$170", cents: ".25" },
  { amount: "$15,000", dollars: "$233", cents: ".42" },
]

export function PricingSection() {
  return (
    <section className="relative overflow-hidden bg-brand-mint py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-extrabold sm:text-5xl">
            <span className="text-brand-lime-dark">Préstamos</span>{" "}
            <span className="text-brand-navy">Personales</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[280px_1fr]">
          <Reveal from="left" className="mx-auto hidden max-w-[280px] lg:block">
            <Image
              src="/images/school-supplies.png"
              alt="Libretas, lápices y útiles escolares"
              width={320}
              height={320}
              className="h-auto w-full mix-blend-multiply"
            />
          </Reveal>

          <ul className="mx-auto w-full max-w-2xl divide-y divide-brand-navy/10">
            {plans.map((plan, i) => (
              <Reveal as="li" key={plan.amount} delay={i * 90} from="up">
                <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 py-4 sm:justify-between sm:gap-x-6">
                  <span className="text-3xl font-extrabold text-brand-navy sm:text-4xl">{plan.amount}</span>
                  <span className="text-lg font-semibold text-brand-blue">desde</span>
                  <span className="text-3xl font-extrabold text-brand-navy sm:text-4xl">
                    {plan.dollars}
                    <span className="text-xl align-baseline">{plan.cents}</span>
                  </span>
                  <span className="text-lg font-bold text-brand-blue">mensual</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
