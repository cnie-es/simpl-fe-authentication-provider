# Table of contents
1. [Participant utility page](#1-participant-utility-page)
2. [Echo page](#2-echo-page)
3. [Ping page](#3-ping-page)
4. [Agent settings page](#4-agent-settings-page)
5. [Filter agent settings](#5-filter-agent-settings)
6. [Keypair detail](#6-keypair-detail)
7. [Filter keypair detail](#7-filter-keypair-detail)
8. [Keypair detail - request new credential](#8-keypair-detail---request-new-credential)
9. [Keypair detail - install credential](#9-keypair-detail---install-credential)
10. [Install credential](#10-install-credential)
11. [Generate or import keypair](#11-generate-or-import-keypair)
12. [Generate a new keypair](#12-generate-a-new-keypair)
13. [Import keypair](#13-import-keypair)

### 1. Participant utility page

Simpl-Open provides a page that offers utilities for participants to check connections and set up the agent.
This page is accessible via the following link `<participant-frontend>/participant-utility`, When you click on this link, you will be asked to log in.
After logging in, the page allows you to access the [Ping](#3-ping-page) and [Echo](#2-echo-page) utilities. For the agent configuration section, please refer to the relevant [section](#4-agent-settings-page).

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/participant%20utility.png)

### 2. Echo page

The echo page helps you understand whether you can communicate with the authority in tier 2, allowing participants to obtain information about the connection and security and receive information about the organization they belong to (identifying who you are).
You can access the page not only via the button ECHO shown in the [section](#1-participant-utility-page), but also via the link. `<participant-frontend>/participant-utility/echo`.

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/echo%20page.png)

### 3. Ping page

The ping page allows you to check whether an agent can communicate with a specific other agent within the dataspace.
You can access the page not only via the button PING shown in the [section](#1-participant-utility-page), but also via the link `<participant-frontend>/participant-utility/ping`.

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/ping%20page.png)

### 4. Agent settings page

The agent settings page allows you to configure the agent.
The page dedicated to agent settings can be accessed via the link `<participant-frontend>/participant-utility/agent-configuration`.
The page contains a table with all the necessary information about the agent and the detailed view and download features.
At the top right, there is a header with the primary features for [generate](#11-generate-a-new-keypair) or [Import](#12-import-keypair) a keypair, [Install](#9-install-credential) credentials and enabling automatic credential renewal.

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/agent%20settings.png)

### 5. Filter agent settings

The agent settings page can be filtered by using the filters provided. The filters are:
- Name
- Active
- Creation date

A combination of these filters will help you search more accurately for what you are looking for. To start the search, use the APPLY button, while, to clear the filters you have entered, use the RESET button.

![](./imgs/authentication-provider/filters%20agent%20settings.png)

### 6. Keypair detail

The keypair detail page allows you to view the details of the keypair.
The page dedicated to keypair detail can be accessed via the link `<participant-frontend>/participant-utility/agent-configuration/keypair/:keypairId`.
The key pair details include the name and creation date. The table displayed in the details allows you to view the credentials and their status, as well as all other information. Active credentials are highlighted with a badge containing the label ACTIVE.
Using the key pair details, you can download the CSR using the button at the top right of the screen or submit a [new request](#8-keypair-detail---request-new-credential) for new credentials.

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/keypair%20detail.png)

### 7. Filter keypair detail

On the key pair details page, you can apply search filters to the credentials.

The credentials are filtered by the following fields:
- Status
- Issuance date
- Expiration date

A combination of these filters will help you search more accurately for what you are looking for. To start the search, use the APPLY button, while, to clear the filters you have entered, use the RESET button.

![](./imgs/authentication-provider/filter%20keypair%20detail.png)

### 8. Keypair detail - request new credential

You can request a new credential for a specific keypair by clicking on the REQUEST NEW CREDENTIAL button in top right corner of the keypair details page.
A window will appear where you can enter the details of the new credential.
Fill the form and click on the SUBMIT button or the CANCEL button for closing the window and return to the keypair details page.
There is no specific route for creating new credentials, as the feature is available in a window that is already accessible to the user.

![](./imgs/authentication-provider/request%20new%20credential.png)

### 9. Keypair detail - install credential

From the details page, in the credentials section, you can view the table with the list of credentials. For each row, you can install the credential using the check mark icon. Click on the icon and a window with the information for the selected credential will appear on the screen. Enter the reason why you are installing the specific credential and continue by clicking the Install credential button or cancel.
There is no specific route for installing credentials, as the feature is available in a window that is already accessible to the user.

![](./imgs/authentication-provider/keypair%20detail%20install%20credential.png)

### 10. Install credential

You can install a credential by clicking on the INSTALL CREDENTIAL button in the agent settings page.
A window will appear where you can upload the file and write the reason. After uploading a file and writing the reason, you can proceed with the installation or cancel.
There is no specific route for installing credentials, as the feature is available in a window that is already accessible to the user.

![](./imgs/authentication-provider/import%20upload%20new%20credentials.png)

### 11. Generate or import keypair

On the agent settings page, using the New Keypair button located at the top left, you can select two different functions: the first to [Generate](#11-generate-a-new-keypair) a new keypair and the second to [Import](#12-import-keypair) a new keypair.
The page dedicated to agent settings can be accessed via the link `<participant-frontend>/participant-utility/agent-configuration`.

(i.e., a user with the **ONBOARDER_M** role, such as the preconfigured user `a.w`)

![](./imgs/authentication-provider/agent%20setting%20generate%20new%20keypair.png)

### 12. Generate a new keypair

To generate a new key pair, click on the New key pair button at the top right and select Generate. A window will appear on the screen. Fill in the only required field and confirm to perform the operation or cancel.
There is no specific route for generate new credentials, as the feature is available in a window that is already accessible to the user.

![](./imgs/authentication-provider/generate%20new%20keypair.png)

### 13. Import keypair

To import a new key pair, click on the New key pair button at the top right and select Import. A window will appear on the screen.
To import a key pair, you need to paste or upload the public and private keys and assign a name to the key pair. To continue with the import keypair operation, use the button at the bottom right of the window Import keypair or Cancel to close and cancel the operation.

> **⚠️** By clicking on the More detail button located at the top right of the keypair import window, you can follow the instructions to generate it.

There is no specific route for generate new credentials, as the feature is available in a window that is already accessible to the user.

![](./imgs/authentication-provider/import%20keypair.png)
![](./imgs/authentication-provider/import%20keypair%20more%20detail.png)
