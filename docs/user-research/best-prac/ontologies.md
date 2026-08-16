This video is a presentation by Frank Coyle, an educator at UC Berkeley, discussing why agentic systems (AI agents) need ontologies. Coyle explains that while large language models (LLMs) are probabilistic and prone to hallucination, ontologies provide formal representation and reasoning capabilities, acting as guardrails to keep AI agents reliable.

Here are the key takeaways from the presentation:

## The Convergence of Two Approaches to AI

The speaker argues that current AI development represents a convergence of two historical approaches:

* **Probabilistic AI (Neural Networks & LLMs):** This approach focuses on predicting the next word based on vast amounts of data [[15:16](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=916)]. While incredibly powerful, LLMs are inherently probabilistic and prone to "hallucinations" [[05:06](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=306)]. Coyle suggests this is actually a feature, similar to human imagination, but it makes them unreliable for tasks requiring strict logic.
* **Symbolic AI (Ontologies & Expert Systems):** This approach involves creating formal, structured representations of knowledge [[06:47](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=407)]. An ontology defines entities, their properties, and their relationships within a specific domain [[05:30](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=330)]. This provides rigid structure but historically struggled to scale.

The blending of these two approaches is often referred to as **Neuro-symbolic AI** [[04:23](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=263)].

## Why Ontologies Are Crucial for Agents

Coyle emphasizes that loops give agents the power to become Turing complete, capable of executing any computational task [[13:27](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=807)]. However, loops introduce dangers [[13:38](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=818)]:

* They can get stuck in infinite cycles.
* The logic can drift off-course as agents interact.
* They can become very expensive as token usage increases.

Ontologies serve as the necessary constraints—or "guardrails"—to prevent these issues [[20:10](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1210)]. Coyle suggests using tools like Pydantic for initial type checking [[17:51](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1071)], but relying on ontologies and reasoning languages (like OWL and RDFS) for complex validation [[19:53](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1193)].

## Practical Applications of Ontologies

Using ontologies allows systems to perform logical inferences and catch errors that are difficult to manage purely with text.

* **Inference (RDFS):** By defining domains and ranges, a system can infer new information. For example, if the verb "teaches" requires the subject to be a "teacher" and the object to be a "student," the statement "Bob teaches Scooter" allows the system to automatically categorize Bob as a teacher and Scooter as a student [[10:11](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=611)].
* **Logical Constraints (OWL):**
* **Functional Properties:** Rules stating an entity can only have one specific relationship (e.g., a person only has one biological mother) [[11:23](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=683)]. This can prevent errors like processing a second refund for the same order [[19:11](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1151)].
* **Disjoint Properties:** Rules stating an entity cannot belong to two conflicting categories simultaneously (e.g., a "Customer" cannot also be a "Support Rep") [[19:26](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1166)]. This prevents illogical actions, like sending a payout to a support desk instead of the customer.



By running the output of an LLM tool call through an ontology validator before executing an action, developers can ensure their agentic systems behave predictably and reliably [[18:23](https://www.youtube.com/watch?v=Sir59K8ZDPU&t=1103)].