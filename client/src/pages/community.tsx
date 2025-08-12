import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Search, Filter, Star, Trophy, Calendar, MapPin, Briefcase, Mail, Phone, Edit, Trash2, MessageCircle } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommunityMemberSchema, type CommunityMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const memberLevelColors = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-gray-100 text-gray-800", 
  Gold: "bg-yellow-100 text-yellow-800",
  Diamond: "bg-blue-100 text-blue-800"
};

const experienceLevelLabels = {
  beginner: "Người mới",
  intermediate: "Trung cấp", 
  advanced: "Nâng cao",
  expert: "Chuyên gia"
};

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [memberLevelFilter, setMemberLevelFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<CommunityMember[]>({
    queryKey: ["/api/community-members"],
    refetchInterval: 30000,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCommunityMemberSchema>) => {
      return await apiRequest("/api/community-members", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-members"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Thành viên mới đã được thêm vào cộng đồng!",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm thành viên mới",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/community-members/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-members"] });
      toast({
        title: "Thành công",
        description: "Thành viên đã được xóa khỏi cộng đồng",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi", 
        description: "Có lỗi xảy ra khi xóa thành viên",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertCommunityMemberSchema>>({
    resolver: zodResolver(insertCommunityMemberSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      interests: [],
      experienceLevel: "beginner",
      investmentFocus: [],
      location: "",
      occupation: "",
      isActive: true,
      memberLevel: "Bronze",
      points: 0,
      socialLinks: [],
      totalInvestment: "",
    },
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExperience = !experienceFilter || experienceFilter === "all" || member.experienceLevel === experienceFilter;
    const matchesLevel = !memberLevelFilter || memberLevelFilter === "all" || member.memberLevel === memberLevelFilter;
    
    return matchesSearch && matchesExperience && matchesLevel;
  });

  const onSubmit = async (values: z.infer<typeof insertCommunityMemberSchema>) => {
    addMemberMutation.mutate(values);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${name} khỏi cộng đồng?`)) {
      deleteMemberMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="page-community">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-slate mb-4 flex items-center" data-testid="text-community-title">
              <Users className="mr-3 h-10 w-10 text-bitcoin" />
              Cộng đồng HHDcoin
            </h1>
            <p className="text-xl text-gray-600" data-testid="text-community-description">
              Kết nối với cộng đồng nhà đầu tư Bitcoin tại Việt Nam
            </p>
            <div className="flex items-center mt-4 space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span data-testid="text-total-members">{members.length} thành viên</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                <span data-testid="text-active-members">
                  {members.filter(m => m.isActive).length} hoạt động
                </span>
              </div>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 lg:mt-0 bg-bitcoin text-white px-6 py-3 rounded-lg font-semibold hover:bg-bitcoin-light"
                data-testid="button-add-member"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Thêm thành viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm thành viên mới</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} data-testid="input-full-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input placeholder="0987654321" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa điểm</FormLabel>
                          <FormControl>
                            <Input placeholder="Hà Nội" {...field} value={field.value || ""} data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mức độ kinh nghiệm</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "beginner"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-experience-level">
                                <SelectValue placeholder="Chọn mức độ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Người mới</SelectItem>
                              <SelectItem value="intermediate">Trung cấp</SelectItem>
                              <SelectItem value="advanced">Nâng cao</SelectItem>
                              <SelectItem value="expert">Chuyên gia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nghề nghiệp</FormLabel>
                          <FormControl>
                            <Input placeholder="Kỹ sư phần mềm" {...field} value={field.value || ""} data-testid="input-occupation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới thiệu bản thân</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Chia sẻ về kinh nghiệm đầu tư và mục tiêu của bạn..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-dark-slate">Thông tin mạng xã hội</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center">
                          <SiFacebook className="mr-2 h-4 w-4 text-blue-600" />
                          Facebook URL
                        </label>
                        <Input 
                          placeholder="https://facebook.com/username" 
                          data-testid="input-facebook-link" 
                          onChange={(e) => {
                            const currentLinks = form.getValues("socialLinks") || [];
                            const newLinks = currentLinks.filter(link => !link.includes("facebook.com"));
                            if (e.target.value) {
                              newLinks.push(e.target.value);
                            }
                            form.setValue("socialLinks", newLinks);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                          Zalo (Số điện thoại)
                        </label>
                        <Input 
                          placeholder="0987654321" 
                          data-testid="input-zalo-link" 
                          onChange={(e) => {
                            const currentLinks = form.getValues("socialLinks") || [];
                            const newLinks = currentLinks.filter(link => !link.includes("zalo.me"));
                            if (e.target.value) {
                              newLinks.push(`https://zalo.me/${e.target.value}`);
                            }
                            form.setValue("socialLinks", newLinks);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-bitcoin text-white"
                      disabled={addMemberMutation.isPending}
                      data-testid="button-submit"
                    >
                      {addMemberMutation.isPending ? "Đang thêm..." : "Thêm thành viên"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm" data-testid="card-filters">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger data-testid="select-filter-experience">
                <SelectValue placeholder="Mức độ kinh nghiệm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="beginner">Người mới</SelectItem>
                <SelectItem value="intermediate">Trung cấp</SelectItem>
                <SelectItem value="advanced">Nâng cao</SelectItem>
                <SelectItem value="expert">Chuyên gia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={memberLevelFilter} onValueChange={setMemberLevelFilter}>
              <SelectTrigger data-testid="select-filter-level">
                <SelectValue placeholder="Cấp độ thành viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setExperienceFilter("all");
                setMemberLevelFilter("all");
              }}
              data-testid="button-clear-filters"
            >
              <Filter className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-members">
            <div className="text-gray-500">Đang tải danh sách thành viên...</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow" data-testid={`member-card-${member.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-bitcoin to-bitcoin-light rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg" data-testid={`member-name-${member.id}`}>
                          {member.fullName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={memberLevelColors[member.memberLevel as keyof typeof memberLevelColors]}
                            data-testid={`member-level-${member.id}`}
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            {member.memberLevel}
                          </Badge>
                          <Badge variant="outline" data-testid={`member-experience-${member.id}`}>
                            {experienceLevelLabels[member.experienceLevel as keyof typeof experienceLevelLabels]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" data-testid={`button-edit-${member.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(member.id, member.fullName)}
                        data-testid={`button-delete-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {member.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3" data-testid={`member-bio-${member.id}`}>
                      {member.bio}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span data-testid={`member-email-${member.id}`}>{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span data-testid={`member-phone-${member.id}`}>{member.phone}</span>
                    </div>
                    {member.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span data-testid={`member-location-${member.id}`}>{member.location}</span>
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span data-testid={`member-occupation-${member.id}`}>{member.occupation}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span data-testid={`member-join-date-${member.id}`}>
                        Tham gia: {new Date(member.joinDate || '').toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {member.interests && member.interests.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Sở thích:</div>
                      <div className="flex flex-wrap gap-1">
                        {member.interests.slice(0, 3).map((interest, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs"
                            data-testid={`member-interest-${member.id}-${index}`}
                          >
                            {interest}
                          </Badge>
                        ))}
                        {member.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Điểm: </span>
                      <span className="font-semibold text-bitcoin" data-testid={`member-points-${member.id}`}>
                        {member.points?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`} 
                         title={member.isActive ? 'Đang hoạt động' : 'Không hoạt động'}>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && !isLoading && (
          <div className="text-center py-12" data-testid="no-members-found">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Không tìm thấy thành viên</h3>
            <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}