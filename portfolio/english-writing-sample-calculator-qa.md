> **Portfolio sample — OrçaFácil Automações.** Independently prepared with AI assistance and editorial review, October 2026. This is *not* commissioned, not published by a client, and not evidence of commercial results. The examples are fictional and are for demonstration only.

# How to QA a Small-Business Price Calculator Before Launch

A quote calculator looks simple from the outside: choose services, enter quantities, and read a total. Yet a calculator can display a perfectly plausible number while applying the wrong discount, mishandling a blank field, or losing information when somebody prints the result. A useful quality check is less about the number of buttons and more about the decisions behind the number.

## Start with a written pricing rule
Before testing the interface, write down the intended formula. For a simple quote, that might be:

**Subtotal = sum of (quantity × unit price)**

**Discounted subtotal = subtotal − (subtotal × discount rate)**

**Total = discounted subtotal + additional charge**

Even this raises questions. Does the extra charge apply before or after the discount? Can a discount exceed 100 percent? Should a blank quantity be treated as zero or as a request for a correction? The software should implement deliberate answers rather than accidental JavaScript behavior.

## Test examples by hand
Build a short table of cases and expected results, independent of the application:

| Case | Inputs | Expected total |
|---|---|---:|
| One item | 2 × $30 | $60 |
| Two items | 1 × $40 and 3 × $10 | $70 |
| Discount | $100 subtotal and 10% discount | $90 |
| Extra charge | $80 after discount, 5% additional charge | $84 |
| Empty basket | No items | $0 |

Do not stop when the basic examples pass. Try decimals, large quantities, negative values, an empty description, and a number so large it could exceed the application's sensible business range.

## Check the user's path, not only the code
Can someone complete the quote on a narrow phone screen? Is the remove-item button usable with a keyboard? Does the total update after a quantity changes? Will the printed page hide editing controls while preserving all essential information?

A manual test should cover at least one small screen, one desktop width, tab navigation, and the browser's print preview. Automated tests can reduce regressions, but they do not replace a visual inspection.

## Treat exported quotes as communications
A price estimate is not the same as a contract or tax invoice. Label the document clearly, include the business name and contact information, and state whether amounts are indicative. If the quote includes expiry dates, check that dates and time zones are unambiguous.

## Close with a maintainability check
Someone else should be able to read the price formula, change a label, and add a service without breaking the application. A short README explaining assumptions, testing steps and known limitations often does more for long-term reliability than another decorative animation.

**Key takeaway:** a useful calculator is one whose arithmetic, constraints and communication can be checked by another person — not just a page that looks finished.
