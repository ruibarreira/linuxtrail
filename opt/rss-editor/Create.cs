using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace rss_editor
{
	public partial class Create : Gtk.Window
	{
		public Create () : 
				base(Gtk.WindowType.Toplevel)
		{
			this.Build ();
		}

		protected void btSave_Clicked (object sender, System.EventArgs e)
		{
			if (tbTitle.Text == "" || tbLink.Text == "" || tbDescription.Text == "" || tbCopyright.Text == "" || tbImgURL.Text == "" || tbImgTitle.Text == "" || tbImgLink.Text == "") {}
			else if (tbImgURL.Text.EndsWith("jpg") == false && tbImgURL.Text.EndsWith("jpeg") == false && tbImgURL.Text.EndsWith("png") == false) {
				warningImgDialog warningImgMessage = new warningImgDialog();
				warningImgMessage.Show();
			}
			else {
				if ((tbLink.Text.StartsWith("http://") || tbLink.Text.StartsWith("https://")) && (tbImgURL.Text.StartsWith("http://") || tbImgURL.Text.StartsWith("https://")) && (tbImgLink.Text.StartsWith("http://") || tbImgLink.Text.StartsWith("https://"))) {
					string location = Convert.ToString(Directory.GetCurrentDirectory()+"/rss.xml");
					StreamWriter WriteRSS = new StreamWriter(location);
					WriteRSS.Write("<?xml version=\"1.0\" encoding=\"utf-8\" ?>" + 
						System.Environment.NewLine + "<rss version=\"2.0\">" + 
						System.Environment.NewLine + "\t<channel>" + 
			    		System.Environment.NewLine + "\t\t<title>" + tbTitle.Text + "</title>" + 
			    		System.Environment.NewLine + "\t\t<link>" + tbLink.Text + "</link>" +
			    		System.Environment.NewLine + "\t\t<description>" + tbDescription.Text + "</description>" + 
			    		System.Environment.NewLine + "\t\t<copyright>" + tbCopyright.Text + "</copyright>" + 
			    		System.Environment.NewLine + "\t\t<language>pt-PT</language>" + 
			    		System.Environment.NewLine + "\t\t<image>" + 
			    		System.Environment.NewLine + "\t\t\t<url>" + tbImgURL.Text + "</url>" + 
			    		System.Environment.NewLine + "\t\t\t<title>" + tbImgTitle.Text + "</title>" + 
			    		System.Environment.NewLine + "\t\t\t<link>" + tbImgLink.Text + "</link>" + 
			    		System.Environment.NewLine + "\t\t</image>" + 
			    		System.Environment.NewLine + "\t</channel>" +
			    		System.Environment.NewLine + "</rss>");
					WriteRSS.Close();
					successfulCreateDialog successfulMessage = new successfulCreateDialog ();
					successfulMessage.Show();
					tbTitle.Text = "";
					tbLink.Text = "";
					tbDescription.Text = "";
					tbCopyright.Text = "";
					tbImgURL.Text = "";
					tbImgTitle.Text = "";
					tbImgLink.Text = "";
				}
				else {
					warningHttpDialog warningHttpMessage = new warningHttpDialog();
					warningHttpMessage.Show();
				}
			}
		}
	}
}

