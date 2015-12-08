using System;
using Gtk;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Microsoft.CSharp;

namespace rss_editor
{
	public partial class warningDeletePublicationDialog : Gtk.Dialog
	{
		public warningDeletePublicationDialog ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			if (File.Exists (Convert.ToString (Directory.GetCurrentDirectory () + "/.rssLocation")) == true) {
				string filepath = File.ReadAllText(Convert.ToString(Directory.GetCurrentDirectory() + "/.rssLocation"));
				if (filepath != String.Empty) {
					string[] full_file = File.ReadAllLines(filepath);
					List<string> new_string = new List<string>();
					new_string.AddRange(full_file);
					if(new_string[13] == "\t</channel>"){
						this.Destroy();
						rss_editor.warningNonExistPublicationDialog NoPublication = new rss_editor.warningNonExistPublicationDialog();
						NoPublication.Show ();
					} 
					else {
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						new_string.RemoveAt(13);
						File.WriteAllLines(filepath, new_string.ToArray());
						this.Destroy();
					}
				}
				else {
					rss_editor.warningRssMissingDialog RssMissing = new rss_editor.warningRssMissingDialog();
					RssMissing.Show();
				}
			}
			else {
				rss_editor.warningRssMissingDialog RssMissing = new rss_editor.warningRssMissingDialog();
				RssMissing.Show();
			}
		}
	}
}

