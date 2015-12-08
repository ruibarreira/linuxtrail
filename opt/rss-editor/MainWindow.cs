using System;
using Gtk;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Microsoft.CSharp;

public partial class MainWindow: Gtk.Window
{	
	public MainWindow (): base (Gtk.WindowType.Toplevel)
	{
		Build ();
	}
	
	protected void OnDeleteEvent (object sender, DeleteEventArgs a)
	{
		Application.Quit ();
		a.RetVal = true;
	}

	protected void Create_clicked (object sender, System.EventArgs e)
	{
		rss_editor.Create create = new rss_editor.Create();
		create.Show();
	}

	protected void Options_clicked (object sender, System.EventArgs e)
	{
		FileChooserDialog Fcd = new FileChooserDialog ("Open file", null, FileChooserAction.Open);

		Fcd.AddButton(Stock.Cancel, ResponseType.Cancel);
		Fcd.AddButton(Stock.Open, ResponseType.Ok);

		Fcd.Filter = new FileFilter();
		Fcd.Filter.AddPattern("*.xml");

		ResponseType RetVal = (ResponseType)Fcd.Run();

		if (RetVal == ResponseType.Ok) {
			StreamWriter writeLocation = new StreamWriter(Directory.GetCurrentDirectory() + "/.rssLocation");
			writeLocation.Write(Fcd.Filename);
			writeLocation.Close();
			Fcd.Destroy();
		} else {
			Fcd.Destroy();
		}
	}

	protected void About_clicked (object sender, System.EventArgs e)
	{
		AboutDialog about = new AboutDialog();
		about.ProgramName = "RSS Editor";
		about.Comments = "Program to create and edit RSS Files" + 
			System.Environment.NewLine +
			System.Environment.NewLine + "Release Notes:" +
			System.Environment.NewLine + 
			System.Environment.NewLine + "The application only ensures a correct edition of files created on it";
		about.Authors = new string [] {"Rui Barreira"};
		about.Copyright = "2015 | Rui Barreira";
		about.License = "RSS Editor is a free application, you can redistribute" + System.Environment.NewLine +
		 				"and/or modify under the terms of the GNU General" + System.Environment.NewLine +
		 				"Public License as published by the Free Software Foundation, " + System.Environment.NewLine +
		 				"either version 2 of the License, or (at your option) any later version." + System.Environment.NewLine +
						System.Environment.NewLine +
						"RSS Editor is distributed in the hope that it will be useful," + System.Environment.NewLine +
						"but WITHOUT ANY WARRANTY; even the implied warranty" + System.Environment.NewLine +
						"of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. " + System.Environment.NewLine +
						"See the GNU General Public License for more details." + System.Environment.NewLine +
						System.Environment.NewLine +
						"You should have received a copy of the GNU General Public " + System.Environment.NewLine +
						"License along with RSS Editor, otherwise write to the Free " + System.Environment.NewLine +
						"Software Foundation, Inc., 51 Franklin Street, Fifth Floor, " + System.Environment.NewLine +
						"Boston, MA 02110-1301 USA (in English)";
		about.Version = "1.0.2";
		about.Run ();
    	about.Destroy ();
	}

	protected void Quit_clicked (object sender, System.EventArgs e)
	{
		Application.Quit();
	}

	protected void btPublish_Clicked (object sender, System.EventArgs e)
	{
		if (File.Exists(Convert.ToString(Directory.GetCurrentDirectory() + "/.rssLocation")) == true) {
			if (tbTitle.Text == "" || tbLink.Text == "" || tbDescription.Text == "" || tbAuthor.Text == "" || (ddCategory.ActiveText == null && tbCategory.Text == "")) {}
			else if (tbLink.Text.StartsWith("http://") || tbLink.Text.StartsWith("https://")) {
				string category;
				if (ddCategory.ActiveText == null) {
					category = tbCategory.Text;
				}
				else {
					category = ddCategory.ActiveText;
				}
				string filepath = File.ReadAllText(Convert.ToString(Directory.GetCurrentDirectory() + "/.rssLocation"));
				string[] full_file = File.ReadAllLines(filepath);
				List<string> new_string = new List<string>();
				new_string.AddRange(full_file);
				new_string.Insert(13, "\t\t<item>" + 
				System.Environment.NewLine + "\t\t\t<title>" + tbTitle.Text + "</title>" + 
				System.Environment.NewLine + "\t\t\t<link>" + tbLink.Text + "</link>" + 
				System.Environment.NewLine + "\t\t\t<description>" + tbDescription.Text + "</description>" + 
				System.Environment.NewLine + "\t\t\t<author>por " + tbAuthor.Text + "</author>" + 
				System.Environment.NewLine + "\t\t\t<category>" + category + "</category>" + 
				System.Environment.NewLine + "\t\t\t<pubDate>" + rss_editor.MainClass.GetCurrentTime() + "</pubDate>" + 
				System.Environment.NewLine + "\t\t</item>");
				File.WriteAllLines(filepath, new_string.ToArray());
				
				rss_editor.successfulPublishDialog successfullyPublished = new rss_editor.successfulPublishDialog ();
				successfullyPublished.Show();
				
				tbTitle.Text = "";
				tbLink.Text = "";
				tbDescription.Text = "";
				tbAuthor.Text = "";
				tbCategory.Text = "";
			}
			else {
				rss_editor.warningHttpDialog warningHttpMessage = new rss_editor.warningHttpDialog();
				warningHttpMessage.Show();
			}
		}
		else {
			rss_editor.warningRssMissingDialog RssMissing = new rss_editor.warningRssMissingDialog();
			RssMissing.Show();
		}
	}

	protected void btDelete_Clicked (object sender, System.EventArgs e)
	{
		if (File.Exists(Convert.ToString(Directory.GetCurrentDirectory() + "/.rssLocation")) == true) {
			rss_editor.warningDeletePublicationDialog deletePublication = new rss_editor.warningDeletePublicationDialog();
			deletePublication.Show();
		}
		else {
			rss_editor.warningRssMissingDialog RssMissing = new rss_editor.warningRssMissingDialog();
			RssMissing.Show();
		}
	}
}
