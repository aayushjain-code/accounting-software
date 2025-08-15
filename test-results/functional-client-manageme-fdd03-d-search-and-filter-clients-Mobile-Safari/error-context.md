# Page snapshot

```yaml
- alert
- button
- heading "BST" [level=1]
- paragraph: Accounting Management
- button
- main:
  - heading "Clients" [level=1]
  - paragraph: Manage your client relationships and business partnerships
  - text: 2 Invoices
  - button "Card View"
  - button "Table View"
  - button "Add Client"
  - textbox "Search clients by name, company, email, or industry...": Test
  - combobox:
    - option "All Status" [selected]
    - option "Active"
    - option "Inactive"
    - option "Prospect"
    - option "Lead"
  - text: 🏢
  - paragraph: No clients found matching your criteria.
- button "Performance Dashboard"
- button "Performance Monitor"
```