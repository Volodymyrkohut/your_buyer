import { ColorPalette } from "@/app/components/kit/ColorPalette"
import { IconShowcase } from "@/app/components/kit/IconShowcase"
import { ButtonVariants } from "@/app/components/kit/ButtonVariants"
import { InputVariants } from "@/app/components/kit/InputVariants"
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  H7,
  H8,
  Paragraph1,
  Paragraph2,
  Caption,
  Small,
  Mini,
} from "@/app/components/kit/Typography"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

export default function UIKitPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <H1>UI Kit Showcase</H1>
          <Paragraph1 className="mt-4 text-grey-600">
            Comprehensive design system components and styles
          </Paragraph1>
        </div>

        {/* Typography Section */}
        <section className="mb-16">
          <H2 className="mb-8">Typography</H2>
          <Card>
            <CardHeader>
              <CardTitle>Headers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <H1>Header 1</H1>
                <Caption className="mt-1 text-grey-500">
                  text-[3.5rem] font-bold leading-[1.1]
                </Caption>
              </div>
              <div>
                <H2>Header 2</H2>
                <Caption className="mt-1 text-grey-500">
                  text-[3rem] font-bold leading-[1.15]
                </Caption>
              </div>
              <div>
                <H3>Header 3</H3>
                <Caption className="mt-1 text-grey-500">
                  text-[2.5rem] font-bold leading-[1.2]
                </Caption>
              </div>
              <div>
                <H4>Header 4</H4>
                <Caption className="mt-1 text-grey-500">
                  text-[2rem] font-bold leading-[1.25]
                </Caption>
              </div>
              <div>
                <H5>Header 5</H5>
                <Caption className="mt-1 text-grey-500">
                  text-[1.75rem] font-bold leading-[1.3]
                </Caption>
              </div>
              <div>
                <H6>Header 6</H6>
                <Caption className="mt-1 text-grey-500">
                  text-[1.5rem] font-semibold leading-[1.35]
                </Caption>
              </div>
              <div>
                <H7>Header 7</H7>
                <Caption className="mt-1 text-grey-500">
                  text-[1.25rem] font-semibold leading-[1.4]
                </Caption>
              </div>
              <div>
                <H8>Header 8</H8>
                <Caption className="mt-1 text-grey-500">
                  text-[1.125rem] font-medium leading-[1.45]
                </Caption>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Body Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Paragraph1>
                  Paragraph 1 - This is the main body text style used for
                  regular content. It provides excellent readability with
                  appropriate line height and font size.
                </Paragraph1>
                <Caption className="mt-1 text-grey-500">
                  text-base leading-[1.5]
                </Caption>
              </div>
              <div>
                <Paragraph2>
                  Paragraph 2 - This is a smaller body text style for secondary
                  content or descriptions.
                </Paragraph2>
                <Caption className="mt-1 text-grey-500">
                  text-sm leading-[1.5]
                </Caption>
              </div>
              <div>
                <Caption>
                  Caption - Used for captions, labels, and small descriptive
                  text.
                </Caption>
                <Caption className="mt-1 text-grey-500">
                  text-xs leading-[1.4]
                </Caption>
              </div>
              <div>
                <Small>
                  Small - This is the small text style for fine print and
                  additional information.
                </Small>
                <Caption className="mt-1 text-grey-500">
                  text-[0.6875rem] leading-[1.3]
                </Caption>
              </div>
              <div>
                <Mini>
                  Mini - The smallest text style for minimal information or
                  disclaimers.
                </Mini>
                <Caption className="mt-1 text-grey-500">
                  text-[0.625rem] leading-[1.2]
                </Caption>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors Section */}
        <section className="mb-16">
          <H2 className="mb-8">Color Palettes</H2>
          <ColorPalette />
        </section>

        {/* Icons Section */}
        <section className="mb-16">
          <H2 className="mb-8">Icons</H2>
          <IconShowcase />
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <H2 className="mb-8">Buttons</H2>
          <ButtonVariants />
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <H2 className="mb-8">Input Fields</H2>
          <InputVariants />
        </section>
      </div>
    </div>
  )
}
