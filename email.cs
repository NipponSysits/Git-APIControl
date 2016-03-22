Task.Factory.StartNew((state) =>
{

}, null);

// Thread E-mail Build Sendding.
Task.Factory.StartNew((state) => 
{
    StringBuilder exMessage = new StringBuilder();
    var user = MembershipService.GetUser(userid);
    var DirectoryRepository = repoLocator.GetRepositoryDirectoryPath(repositoryName).FullName + "\\";
    var DirectoryGitData = "D:\\temp\\GitSince-Email\\";
    String logPush = "git-push." + userid + ".txt", logDate = userid + "." + repositoryName + ".since";

    try
    {
        var provider = System.Globalization.CultureInfo.InstalledUICulture;
        var revlist = RunGit(gitPath, "rev-list --all --count", DirectoryRepository);

        if (!Directory.Exists(DirectoryGitData)) Directory.CreateDirectory(DirectoryGitData);

        var sinceFormat = "yyyy-MM-dd HH:mm:ss zzz";
        var since = "-n 1 ";
        if (File.Exists(DirectoryGitData + logDate))
        {
            var sinceDate = File.ReadAllText(DirectoryGitData + logDate).Trim();
            var onDate = DateTime.ParseExact(sinceDate, sinceFormat, provider).AddSeconds(1).GetDateTimeFormats();
            if(onDate.Length > 34) sinceDate = onDate[34];
            since = String.Format("--since=\"{0}\" ", sinceDate);
            File.Delete(DirectoryGitData + logDate);
        }
        var command = String.Format("/c \"{0} --no-pager log --all --source --stat --date=iso --name-status {1}", gitPath, since);
        var userCommand = String.Format("{0}--author={1}\" > D:/temp/GitSince-Email/{2}", command, user.Email, logPush);
        var otherCommand = String.Format("{0}\" > D:/temp/GitSince-Email/{2}", command, user.Email, logPush);
        var revLog = this.RunGit("cmd.exe", userCommand, DirectoryRepository);
        var logs = File.ReadAllText(DirectoryGitData + logPush);
        var commit = Regex.Matches(logs, @"commit.([0-9a-f]{40})\Wrefs/(.*)\n");

        if(commit.Count == 0 )
        {
            revLog = this.RunGit("cmd.exe", otherCommand, DirectoryRepository);
            logs = File.ReadAllText(DirectoryGitData + logPush);
            commit = Regex.Matches(logs, @"commit.([0-9a-f]{40})\Wrefs/(.*)\n");
        }

        exMessage.AppendLine("cmd.exe " + userCommand);
        exMessage.AppendLine("Target: " + DirectoryRepository);
        exMessage.AppendLine("Item1: " + revLog.Item1 + " , Item2: " + revLog.Item2);

        if (String.IsNullOrWhiteSpace(revLog.Item2) && String.IsNullOrWhiteSpace(revLog.Item1))
        {

            var dataCommit = new NameValueCollection();
            var dataDetail = new NameValueCollection();
            var dataFiles = new DataTable();
            dataFiles.TableName = "file";
            dataFiles.Columns.Add("filename");
            dataFiles.Columns.Add("status");
            dataFiles.Columns.Add("filepath");

            var mail = new SmtpHtmlMailHelper(String.Format(Resources.Git_Push_EmailSubject, user.DisplayName, repositoryName));
            mail.BodyHtml("git.head.html");

            var indexLogNext = 0;

            foreach (Match log in commit)
            {
                indexLogNext += log.Index;
                var text = logs.Substring(log.Index, log.NextMatch().Index == 0 ? logs.Length - log.Index : log.NextMatch().Index - indexLogNext);
                var branch = log.Groups["branch"].Value;

                exMessage.AppendLine("substring(" + log.Index + "," + (log.NextMatch().Index == 0 ? logs.Length - log.Index : log.NextMatch().Index - indexLogNext) + ")");

                Int32 limitRows = 50, i = 0;
                var logItem = Regex.Split(text, @"\n\n");
                var logSummary = Regex.Match(logItem[0], @"commit.(?<id>[0-9a-f]{40})\Wrefs/(?<branch>.*)[\W\w]+?Author:.(?<author>.*?>)\W+Date:.(?<date>.*)");
                var branch_name = Path.GetFileName(logSummary.Groups["branch"].Value.Trim());

                dataCommit.Add("commit_index", revlist.Item1);
                dataCommit.Add("commit_id", logSummary.Groups["id"].Value);
                dataCommit.Add("comment_limit", RepositoryCommitModelHelpers.MakeCommitMessage(logItem[1], 30).ShortTitle);
                dataCommit.Add("comment_full", Regex.Replace(logItem[1], "\n$", "").Replace("\n", "<br>"));
                dataCommit.Add("repository", repositoryName);
                dataCommit.Add("commit_branch", "refs/" + logSummary.Groups["branch"].Value.Trim());
                dataCommit.Add("commit_name", logSummary.Groups["author"].Value.Replace("<", "&#60;").Replace(">", "&#62;"));

                var sinceDate = logSummary.Groups["date"].Value.Trim();
                var onDate = DateTime.ParseExact(logSummary.Groups["date"].Value.Trim(), sinceFormat, provider).AddSeconds(1).GetDateTimeFormats();
                if (onDate.Length > 34) sinceDate = onDate[34];

                dataCommit.Add("commit_date", sinceDate);
                dataCommit.Add("domain_name", "dev.ns.co.th");

                if (dataDetail.Count == 0)
                {
                    dataDetail.Add("commit_btn", "Go to commit id " + logSummary.Groups["id"].Value.Substring(0, 7));
                    dataDetail.Add("commit_id", logSummary.Groups["id"].Value);
                    dataDetail.Add("commit_link", @"//dev.ns.co.th:810/Repository/" + repositoryName + @"/" + branch_name + "/Commit/" + logSummary.Groups["id"].Value);
                    dataDetail.Add("domain_name", "dev.ns.co.th");
                    dataDetail.Add("limit_rows", limitRows.ToString());
                    dataDetail.Add("comment_full", Regex.Replace(logItem[1], "\n$", "").Replace("\n", "<br>"));
                }

                var merge = Regex.Match(text, @"Merge:.(?<merge>[0-9a-f\W]{15})");
                var tdMerge = String.Format("<tr><td class=\"four col-name\">Parents:</td><td class=\"eight col-value\">{0}</td></tr>", merge.Groups["merge"].Value);
                dataCommit.Add("merge_row", !String.IsNullOrEmpty(merge.Groups["merge"].Value) ? tdMerge : "");
                exMessage.AppendLine("data commited.");

                if (!File.Exists(DirectoryGitData + logDate)) File.WriteAllText(DirectoryGitData + logDate, logSummary.Groups["date"].Value.Trim());

                if (logItem.Length > 2)
                {
                    exMessage.AppendLine("logItem check");
                    var logFiles = Regex.Matches(logItem[2], @"(?<change>\w{1}).+?(?<file>.*?)\n");
                    foreach (Match list in logFiles)
                    {
                        if (i >= limitRows) break;
                        var filename = Path.GetFileName(list.Groups["file"].Value);
                        var directory = Path.GetDirectoryName(list.Groups["file"].Value) + @"\";
                        var change = "None";
                        switch (list.Groups["change"].Value.Trim())
                        {
                            case "A": change = "+"; break;
                            case "M": change = "&nbsp;"; break;
                            case "D": change = "-"; break;
                        }
                        dataFiles.Rows.Add(new Object[] { filename, change, directory });
                        i++;
                    }
                    exMessage.AppendLine("logItem change filed.");
                }

                mail.BodyHtml("git.body.html");
                mail.Data(dataCommit);
                if (dataFiles.Rows.Count > 0)
                {
                    mail.BodyHtml("git.file.html");
                    mail.DataCollection(dataFiles);
                }
                mail.Body("<hr><br>");
                dataFiles.Rows.Clear();
                dataCommit.Clear();

            }

            mail.BodyHtml("git.foot.html");
            mail.Data(dataDetail);

            exMessage.AppendLine("mail build complated.");

            if (commit.Count == 0) throw new Exception("Git not found logs data.");

            var message = new MailMessage();
            message.From = new MailAddress("pgm@ns.co.th");

            // message.To.Add("kem@ns.co.th");
            foreach (var users in MembershipService.GetAllUsers())
            {
                if (RepositoryPermissionService.IsRepositorySenior(users.Name, repositoryName))
                {
                    message.To.Add(users.Email);
                }
                foreach (var role in RoleProvider.GetRolesForUser(users.Name))
                {
                    if (role == Definitions.Roles.Administrator) message.CC.Add(users.Email);
                }
            }
            
            exMessage.AppendLine("Send: " + mail.Send(message).ToString());
        }
        else
        {
            //Others Events
        }
        if (File.Exists(DirectoryGitData + logPush)) File.Delete(DirectoryGitData + logPush);
    }
    catch (Exception ex)
    {
        var DirectoryGitException = DirectoryGitData + "..\\logs\\GitEmailException\\";
        String logEx = DateTime.Now.ToString("yyyyMMddHHmmss") + "." + userid + "." + repositoryName;
        if (File.Exists(DirectoryGitData + logPush))
        {
            File.Copy(DirectoryGitData + logPush, DirectoryGitException + logEx + ".txt");
            File.Delete(DirectoryGitData + logPush);
        }
        exMessage.AppendLine("-------------------------------------------------------------------------------------------------");
        exMessage.AppendLine(ex.Message);
        exMessage.AppendLine(ex.Source);
        exMessage.AppendLine(ex.StackTrace);
        if (!Directory.Exists(DirectoryGitException)) Directory.CreateDirectory(DirectoryGitException);
        File.WriteAllText(DirectoryGitException + logEx + ".log", exMessage.ToString());
    }
}, null);